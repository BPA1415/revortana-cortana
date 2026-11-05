# revortana-cortana

A private Cortana revival server made by guutut (riro)

## Requirements

- Python 3.8 or newer
- The certificate and key files `localhost+4.pem` and `localhost+4-key.pem`
  in the project directory

The Python dependency is installed from `requirements.txt`.

The home page includes a small nostalgic assistant-themed interface.
Built-in replies are local. Other questions are sent to OpenAI when you
configure an API key; they are not sent to Cortana or Microsoft.

## Linux setup

1. Install Python and its virtual-environment support. For Debian or Ubuntu:

   ```sh
   sudo apt update
   sudo apt install python3 python3-venv
   ```

2. Clone or copy this project and ensure the certificate and key files are in
   the project directory.
3. Start the server:

   ```sh
   chmod +x run_linux.sh
   ./run_linux.sh
   ```

   The launcher creates a local `.venv`, installs the requirements, and runs
   the server on `https://127.0.0.1:443`. Port 443 normally requires elevated
   privileges; if startup fails with a permission error, use the systemd
   setup below rather than running the server as root.
4. If the client needs these domains redirected to this server, add the
   following line to `/etc/hosts`:

   ```text
   127.0.0.1 live.com microsoft.com bing.com
   ```

   Edit the file with administrator privileges (for example,
   `sudoedit /etc/hosts`). Remove the line when you no longer want those
   domains redirected.

### Optional systemd service

The included `revortana@.service` is a system service template. It runs under
the specified local account, expects the project at
`~/revortana-cortana`, and grants only the capability needed to bind port 443.
From the project directory, create the virtual environment before installing
the service:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Then install and start it with:

```sh
sudo cp revortana@.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now "revortana@$(id -un).service"
```

If the project is in a different directory, edit `WorkingDirectory` and
`ExecStart` in `/etc/systemd/system/revortana@.service` before starting it.
Check the service with `systemctl status "revortana@$(id -un).service"` and
view logs with `journalctl -u "revortana@$(id -un).service"`.
To enable OpenAI replies for the service, create
`~/.config/revortana/openai.env`, add `OPENAI_API_KEY=your-api-key`, restrict
the file with `chmod 600 ~/.config/revortana/openai.env`, then restart the
service. Create the parent directory first if needed with
`mkdir -p ~/.config/revortana`. Do not commit this file.

## Configuration

The host, port, certificate, and private key can be overridden with
`REVORTANA_HOST`, `REVORTANA_PORT`, `REVORTANA_CERT`, and `REVORTANA_KEY`.
For example, `REVORTANA_PORT=8443 ./run_linux.sh` uses an unprivileged port on
Linux; on Windows, set `REVORTANA_PORT` before running `run_windows.bat`.
Relative certificate and key paths are resolved from the project directory.

### OpenAI replies

Set `OPENAI_API_KEY` in the server's environment to enable answers to
unmatched questions. The key stays on the server and is never sent to the
browser. The default model is `gpt-4o-mini`; change it with
`REVORTANA_OPENAI_MODEL`. OpenAI may charge for API usage. Questions sent for
AI replies are processed by OpenAI, so do not submit sensitive information.
The server has no user authentication and listens only on `127.0.0.1` by
default. Avoid exposing it to the public internet, especially with an API key
configured.

On Linux, set the key in the shell before launching:

```sh
export OPENAI_API_KEY="your-api-key"
./run_linux.sh
```

In PowerShell, set it for the current session before launching:

```powershell
$env:OPENAI_API_KEY = "your-api-key"
.\run_windows.bat
```

Do not put the key in source files or commit it to the repository.

## Windows setup

1. Install Python 3.8 or newer and make sure the Python launcher (`py`) or
   `python` command is available.
2. Keep the certificate and key files in the project directory.
3. From File Explorer, double-click `run_windows.bat`, or run it from
   Command Prompt or PowerShell in the project directory:

   ```powershell
   .\run_windows.bat
   ```

   The launcher creates a local `.venv`, installs the requirements, and starts
   the HTTPS server. Port 443 can require elevated privileges on Windows too.
   To use an unprivileged port instead, set it before launching:

   ```powershell
   $env:REVORTANA_PORT = "8443"
   .\run_windows.bat
   ```

   In Command Prompt, use `set REVORTANA_PORT=8443` before running the batch
   file.
4. If the client needs these domains directed to the server, open Notepad as
   Administrator and add this line to
   `C:\Windows\System32\drivers\etc\hosts`:

   ```text
   127.0.0.1 live.com microsoft.com bing.com
   ```

   Remove the line when you no longer want those domains redirected.

The server can also be started directly on either platform after installing
the requirements with `python -m pip install -r requirements.txt`:

```sh
python revortana.py
```

Port 443 may require elevated privileges on both Linux and Windows.

## Development

Install the test dependencies with `python -m pip install -r requirements-dev.txt`
and run `python -m pytest`.

## Related projects

- https://github.com/BPA1415/revortana-cortana-2.1
- https://github.com/BPA1415/revortana-cortana-2
