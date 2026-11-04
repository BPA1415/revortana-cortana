import json
import logging
import os
import ssl
from dataclasses import dataclass
from http.client import HTTPException
from pathlib import Path
from typing import Mapping, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from flask import Flask, jsonify, render_template, request

PROJECT_DIR = Path(__file__).resolve().parent
logger = logging.getLogger(__name__)
OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions"


class OpenAIConfigurationError(RuntimeError):
    pass


class OpenAIServiceError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True)
class ServerConfig:
    host: str
    port: int
    certificate: Path
    private_key: Path


def create_app() -> Flask:
    application = Flask(__name__)

    @application.get("/")
    def home():
        return render_template("index.html")

    @application.get("/healthz")
    def health():
        return jsonify({"status": "ok"})

    @application.post("/api/ask")
    def ask():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify({"error": "Send a JSON object with a question."}), 400

        message = payload.get("question")
        if not isinstance(message, str) or not message.strip():
            return jsonify({"error": "Enter a question first."}), 400
        message = message.strip()
        if len(message) > 240:
            return jsonify({"error": "Questions must be 240 characters or fewer."}), 400

        try:
            answer = ask_openai(message)
        except OpenAIConfigurationError:
            return jsonify(
                {
                    "error": (
                        "AI replies are not configured. Check OPENAI_API_KEY "
                        "and REVORTANA_OPENAI_MODEL on the server."
                    )
                }
            ), 503
        except OpenAIServiceError as error:
            return jsonify({"error": str(error)}), error.status_code

        return jsonify({"reply": answer})

    @application.route(
        "/<path:path>",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
    def catch_all(path: str):
        logger.info("Received %s request for /%s", request.method, path)
        return jsonify(
            {"status": "Success", "message": "Revortana is handling this."}
        )

    return application


app = create_app()


def ask_openai(message: str) -> str:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise OpenAIConfigurationError("OPENAI_API_KEY is not set")

    model = os.environ.get("REVORTANA_OPENAI_MODEL", "gpt-4o-mini").strip()
    if not model:
        raise OpenAIConfigurationError("REVORTANA_OPENAI_MODEL must not be empty")

    body = json.dumps(
        {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are Revortana, a warm, concise assistant in a "
                        "nostalgic local revival. Be helpful and truthful. "
                        "Do not claim to be Microsoft's Cortana or to access "
                        "its original services. If unsure, say so."
                    ),
                },
                {"role": "user", "content": message},
            ],
            "max_completion_tokens": 300,
        }
    ).encode("utf-8")
    api_request = Request(
        OPENAI_CHAT_COMPLETIONS_URL,
        data=body,
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(api_request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        logger.warning("OpenAI request failed with HTTP status %s", error.code)
        if error.code == 429:
            raise OpenAIServiceError(
                "OpenAI is busy right now. Please try again shortly.",
                status_code=503,
            ) from error
        raise OpenAIServiceError(
            "OpenAI could not answer just now. Please try again."
        ) from error
    except (URLError, TimeoutError, HTTPException, OSError) as error:
        logger.warning("Could not reach OpenAI: %s", error)
        raise OpenAIServiceError(
            "I couldn’t reach OpenAI. Check the server’s internet connection "
            "and try again.",
            status_code=503,
        ) from error
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        logger.warning("OpenAI returned an invalid response")
        raise OpenAIServiceError(
            "OpenAI returned an unreadable response. Please try again."
        ) from error

    try:
        answer = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        logger.warning("OpenAI response did not contain an answer")
        raise OpenAIServiceError(
            "OpenAI returned an unexpected response. Please try again."
        ) from error
    if not isinstance(answer, str) or not answer.strip():
        raise OpenAIServiceError("OpenAI returned an empty answer. Please try again.")
    return answer.strip()


def _configured_path(
    variable: str, default: str, environ: Mapping[str, str]
) -> Path:
    path = Path(environ.get(variable, default)).expanduser()
    if not path.is_absolute():
        path = PROJECT_DIR / path
    return path


def load_config(environ: Optional[Mapping[str, str]] = None) -> ServerConfig:
    settings = os.environ if environ is None else environ
    host = settings.get("REVORTANA_HOST", "127.0.0.1").strip()
    if not host:
        raise ValueError("REVORTANA_HOST must not be empty")

    try:
        port = int(settings.get("REVORTANA_PORT", "443"))
    except ValueError as error:
        raise ValueError("REVORTANA_PORT must be an integer") from error
    if not 1 <= port <= 65535:
        raise ValueError("REVORTANA_PORT must be between 1 and 65535")

    return ServerConfig(
        host=host,
        port=port,
        certificate=_configured_path(
            "REVORTANA_CERT", "localhost+4.pem", settings
        ),
        private_key=_configured_path(
            "REVORTANA_KEY", "localhost+4-key.pem", settings
        ),
    )


def create_ssl_context(config: ServerConfig) -> ssl.SSLContext:
    for label, path in (
        ("certificate", config.certificate),
        ("private key", config.private_key),
    ):
        if not path.is_file():
            raise FileNotFoundError(f"TLS {label} file not found: {path}")

    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(
        certfile=str(config.certificate),
        keyfile=str(config.private_key),
    )
    return context


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    config = load_config()
    tls_context = create_ssl_context(config)

    logger.info("Starting HTTPS server on %s:%s", config.host, config.port)
    try:
        app.run(
            host=config.host,
            port=config.port,
            ssl_context=tls_context,
            debug=False,
            use_reloader=False,
            threaded=True,
        )
    except PermissionError as error:
        raise PermissionError(
            f"Cannot bind to {config.host}:{config.port}. Choose an available "
            "port above 1024 with REVORTANA_PORT, or grant permission to use "
            "this port."
        ) from error


if __name__ == "__main__":
    main()
