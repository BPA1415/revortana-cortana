import json
import ssl
from urllib.error import HTTPError

import pytest

import revortana


@pytest.fixture()
def client():
    return revortana.create_app().test_client()


def test_home_page_renders_nostalgic_assistant_interface(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.mimetype == "text/html"
    page = response.get_data(as_text=True)
    assert "Revortana" in page
    assert "A little piece of the future, remembered." in page
    assert 'id="ask-form"' in page


def test_home_page_includes_local_assets(client):
    page = client.get("/").get_data(as_text=True)

    assert client.get("/static/style.css").status_code == 200
    assert client.get("/static/app.js").status_code == 200
    for asset in (
        "assistant.css",
        "assistant-personality.js",
        "assistant-skills.js",
        "assistant-effects.js",
    ):
        assert client.get("/static/" + asset).status_code == 200
        assert asset in page
    assert "/static/style.css" in page
    assert "/static/app.js" in page


def test_assistant_extras_provide_profile_skills_and_effects(client):
    page = client.get("/").get_data(as_text=True)
    skills = client.get("/static/assistant-skills.js").get_data(as_text=True)
    effects = client.get("/static/assistant-effects.js").get_data(as_text=True)
    styles = client.get("/static/assistant.css").get_data(as_text=True)
    app_script = client.get("/static/app.js").get_data(as_text=True)

    assert 'id="sound-toggle"' in page
    assert "window.RevortanaPersonality" in app_script
    assert "window.RevortanaSkills.run(text)" in app_script
    assert "window.RevortanaEffects" in effects
    assert "unlockAudio" in effects
    assert "AudioContext" in effects
    assert "flip a coin" in skills
    assert "roll a die" in skills
    assert "give me a riddle" in skills
    assert "is-thinking .orb" in styles


def test_static_assets_include_windows_8_1_browser_fallbacks(client):
    page = client.get("/").get_data(as_text=True)
    styles = client.get("/static/style.css").get_data(as_text=True)

    assert 'http-equiv="X-UA-Compatible"' in page
    for asset in (
        "app.js",
        "assistant-personality.js",
        "assistant-skills.js",
        "assistant-effects.js",
    ):
        script = client.get("/static/" + asset).get_data(as_text=True)
        if asset == "app.js":
            assert "XMLHttpRequest" in script
        for unsupported_syntax in (
            "const ",
            "let ",
            "async ",
            "await ",
            "=>",
            "fetch(",
        ):
            assert unsupported_syntax not in script
    assert "font-size: 58px;" in styles
    assert "width: calc(100% - 48px);" in styles


def test_static_assistant_includes_more_local_reply_topics(client):
    script = client.get("/static/app.js").get_data(as_text=True)

    for reply in (
        "Berlin is the capital of Germany.",
        "Canberra is the capital of Australia.",
        "I’m rather fond of blue",
        "sunlight takes about eight minutes",
        "A black hole is a region of space",
        "The Sun is the star at the center",
        "I’m sorry you’re having a hard moment.",
    ):
        assert reply in script


def test_static_assistant_has_34_additional_local_replies(client):
    script = client.get("/static/app.js").get_data(as_text=True)
    additional_replies = script.split("var additionalReplies = [", 1)[1].split(
        "\n  ];", 1
    )[0]

    assert additional_replies.count("{ pattern:") == 34
    assert "Brasília is the capital of Brazil." in additional_replies
    assert "Mars is often called the Red Planet" in additional_replies


def test_static_assistant_has_60_more_local_replies(client):
    script = client.get("/static/app.js").get_data(as_text=True)
    more_replies = script.split("var moreReplies = [", 1)[1].split(
        "\n  ];", 1
    )[0]

    assert more_replies.count("{ pattern:") == 60
    assert "Lisbon is the capital of Portugal." in more_replies
    assert "I’m sorry you’re feeling lonely." in more_replies
    assert "How about Luma" in more_replies


def test_windows_vista_launcher_uses_python_36_dependencies():
    launcher = (revortana.PROJECT_DIR / "run_windows_vista.bat").read_text()
    requirements = (
        revortana.PROJECT_DIR / "requirements-windows-vista.txt"
    ).read_text()

    assert "py -3.6 -m venv" in launcher
    assert "requirements-windows-vista.txt" in launcher
    assert "Flask==2.0.3" in requirements
    assert "dataclasses==0.8" in requirements


@pytest.mark.parametrize(
    ("launcher_name", "requirements_name"),
    [
        ("run_windows_7.bat", "requirements-windows-7.txt"),
        ("run_windows_8.1.bat", "requirements-windows-8.1.txt"),
    ],
)
def test_legacy_windows_launchers_use_python_38_compatible_dependencies(
    launcher_name, requirements_name
):
    launcher = (revortana.PROJECT_DIR / launcher_name).read_text()
    requirements = (
        revortana.PROJECT_DIR / requirements_name
    ).read_text().splitlines()

    assert "py -3.8 -m venv" in launcher
    assert requirements_name in launcher
    assert "Flask==3.0.3" in requirements
    assert "Werkzeug==3.0.6" in requirements


@pytest.mark.parametrize(
    ("folder", "launcher_name", "requirements_name", "venv"),
    [
        (
            "winvista",
            "run_windows_vista.bat",
            "requirements-windows-vista.txt",
            ".venv-windows-vista",
        ),
        (
            "win7",
            "run_windows_7.bat",
            "requirements-windows-7.txt",
            ".venv-windows7",
        ),
        (
            "win8.1",
            "run_windows_8.1.bat",
            "requirements-windows-8.1.txt",
            ".venv-windows81",
        ),
    ],
)
def test_platform_folder_copies_work_from_project_root(
    folder, launcher_name, requirements_name, venv
):
    root = revortana.PROJECT_DIR
    launcher = (root / folder / launcher_name).read_text()

    assert (root / folder / requirements_name).read_text() == (
        root / requirements_name
    ).read_text()
    assert 'cd /d "%SCRIPT_DIR%.." || exit /b 1' in launcher
    assert f'set "VENV_DIR={venv}"' in launcher
    assert requirements_name in launcher
    assert f'"%VENV_DIR%\\Scripts\\python.exe" revortana.py' in launcher


def test_health_endpoint_returns_json(client):
    response = client.get("/healthz")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_ai_endpoint_requires_json_object(client):
    response = client.post("/api/ask", data="not json")

    assert response.status_code == 400
    assert response.get_json() == {"error": "Send a JSON object with a question."}


@pytest.mark.parametrize(
    "payload",
    [{}, {"question": ""}, {"question": "  "}, {"question": 42}],
)
def test_ai_endpoint_rejects_empty_or_non_string_question(client, payload):
    response = client.post("/api/ask", json=payload)

    assert response.status_code == 400
    assert response.get_json() == {"error": "Enter a question first."}


def test_ai_endpoint_rejects_questions_over_limit(client):
    response = client.post("/api/ask", json={"question": "x" * 241})

    assert response.status_code == 400
    assert "240 characters" in response.get_json()["error"]


def test_ai_endpoint_requires_server_side_api_key(client, monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    response = client.post("/api/ask", json={"question": "What is a black hole?"})

    assert response.status_code == 503
    assert "OPENAI_API_KEY" in response.get_json()["error"]


def test_openai_request_uses_server_key_and_returns_answer(
    client, monkeypatch
):
    monkeypatch.setenv("OPENAI_API_KEY", "server-secret")
    monkeypatch.setenv("REVORTANA_OPENAI_MODEL", "test-model")
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def read(self):
            return json.dumps(
                {"choices": [{"message": {"content": "A distant star."}}]}
            ).encode("utf-8")

    def fake_urlopen(api_request, timeout):
        captured["url"] = api_request.full_url
        captured["authorization"] = api_request.get_header("Authorization")
        captured["body"] = json.loads(api_request.data.decode("utf-8"))
        captured["timeout"] = timeout
        return FakeResponse()

    monkeypatch.setattr(revortana, "urlopen", fake_urlopen)
    response = client.post(
        "/api/ask", json={"question": " What is a black hole? "}
    )

    assert response.status_code == 200
    assert response.get_json() == {"reply": "A distant star."}
    assert captured["url"] == revortana.OPENAI_CHAT_COMPLETIONS_URL
    assert captured["authorization"] == "Bearer server-secret"
    assert captured["body"]["model"] == "test-model"
    assert captured["body"]["messages"][-1] == {
        "role": "user",
        "content": "What is a black hole?",
    }
    assert captured["timeout"] == 30


def test_openai_rate_limit_returns_a_retryable_message(client, monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "server-secret")

    def rate_limited(*args, **kwargs):
        raise HTTPError(
            revortana.OPENAI_CHAT_COMPLETIONS_URL,
            429,
            "Too Many Requests",
            {},
            None,
        )

    monkeypatch.setattr(revortana, "urlopen", rate_limited)
    response = client.post("/api/ask", json={"question": "Tell me a story"})

    assert response.status_code == 503
    assert "busy" in response.get_json()["error"]


@pytest.mark.parametrize("method", ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
def test_unknown_endpoint_returns_generic_response(client, method):
    response = client.open("/api/example", method=method)

    assert response.status_code == 200
    assert response.get_json() == {
        "status": "Success",
        "message": "Revortana is handling this.",
    }


def test_config_defaults_resolve_tls_files_from_project_directory():
    config = revortana.load_config({})

    assert config.host == "127.0.0.1"
    assert config.port == 443
    assert config.certificate == revortana.PROJECT_DIR / "localhost+4.pem"
    assert config.private_key == revortana.PROJECT_DIR / "localhost+4-key.pem"


def test_config_accepts_custom_host_port_and_tls_paths(tmp_path):
    config = revortana.load_config(
        {
            "REVORTANA_HOST": "0.0.0.0",
            "REVORTANA_PORT": "8443",
            "REVORTANA_CERT": str(tmp_path / "certificate.pem"),
            "REVORTANA_KEY": "custom-key.pem",
        }
    )

    assert config.host == "0.0.0.0"
    assert config.port == 8443
    assert config.certificate == tmp_path / "certificate.pem"
    assert config.private_key == revortana.PROJECT_DIR / "custom-key.pem"


def test_relative_tls_paths_are_independent_of_current_directory(
    tmp_path, monkeypatch
):
    monkeypatch.chdir(tmp_path)

    config = revortana.load_config(
        {"REVORTANA_CERT": "certs/server.pem", "REVORTANA_KEY": "certs/server.key"}
    )

    assert config.certificate == revortana.PROJECT_DIR / "certs/server.pem"
    assert config.private_key == revortana.PROJECT_DIR / "certs/server.key"


@pytest.mark.parametrize(
    ("environment", "message"),
    [
        ({"REVORTANA_HOST": " "}, "REVORTANA_HOST must not be empty"),
        ({"REVORTANA_PORT": "not-a-port"}, "REVORTANA_PORT must be an integer"),
        (
            {"REVORTANA_PORT": "0"},
            "REVORTANA_PORT must be between 1 and 65535",
        ),
        (
            {"REVORTANA_PORT": "65536"},
            "REVORTANA_PORT must be between 1 and 65535",
        ),
    ],
)
def test_config_rejects_invalid_host_or_port(environment, message):
    with pytest.raises(ValueError, match=message):
        revortana.load_config(environment)


def test_ssl_context_rejects_missing_certificate(tmp_path):
    config = revortana.ServerConfig(
        host="127.0.0.1",
        port=8443,
        certificate=tmp_path / "missing-cert.pem",
        private_key=tmp_path / "missing-key.pem",
    )

    with pytest.raises(FileNotFoundError, match="TLS certificate file not found"):
        revortana.create_ssl_context(config)


def test_ssl_context_loads_project_certificate_and_key():
    config = revortana.ServerConfig(
        host="127.0.0.1",
        port=8443,
        certificate=revortana.PROJECT_DIR / "localhost+4.pem",
        private_key=revortana.PROJECT_DIR / "localhost+4-key.pem",
    )

    context = revortana.create_ssl_context(config)

    assert isinstance(context, ssl.SSLContext)


def test_main_starts_server_with_configured_tls(monkeypatch, tmp_path):
    certificate = tmp_path / "certificate.pem"
    private_key = tmp_path / "private-key.pem"
    certificate.touch()
    private_key.touch()
    monkeypatch.setenv("REVORTANA_HOST", "0.0.0.0")
    monkeypatch.setenv("REVORTANA_PORT", "8443")
    monkeypatch.setenv("REVORTANA_CERT", str(certificate))
    monkeypatch.setenv("REVORTANA_KEY", str(private_key))

    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    captured_options = {}
    monkeypatch.setattr(revortana, "create_ssl_context", lambda config: context)
    monkeypatch.setattr(
        revortana.app, "run", lambda **kwargs: captured_options.update(kwargs)
    )
    revortana.main()

    assert captured_options == {
        "host": "0.0.0.0",
        "port": 8443,
        "ssl_context": context,
        "debug": False,
        "use_reloader": False,
        "threaded": True,
    }


def test_main_explains_port_permission_error(monkeypatch):
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    monkeypatch.setenv("REVORTANA_HOST", "127.0.0.1")
    monkeypatch.setenv("REVORTANA_PORT", "443")

    def deny_bind(**kwargs):
        raise PermissionError("permission denied")

    monkeypatch.setattr(revortana, "create_ssl_context", lambda config: context)
    monkeypatch.setattr(revortana.app, "run", deny_bind)

    with pytest.raises(PermissionError, match="Cannot bind to 127.0.0.1:443"):
        revortana.main()
