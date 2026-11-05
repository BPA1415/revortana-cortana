@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.." || exit /b 1

set "VENV_DIR=.venv-windows-vista"
if not exist "%VENV_DIR%\Scripts\python.exe" (
    where py >nul 2>nul
    if not errorlevel 1 (
        py -3.6 -m venv "%VENV_DIR%"
    ) else (
        python -c "import sys; sys.exit(0 if sys.version_info[:2] == (3, 6) else 1)"
        if errorlevel 1 (
            echo Python 3.6 is required. Install Python 3.6 and the Python launcher.
            exit /b 1
        )
        python -m venv "%VENV_DIR%"
    )
    if errorlevel 1 (
        echo Could not create the virtual environment. Verify Python 3.6 is installed.
        exit /b 1
    )
)

"%VENV_DIR%\Scripts\python.exe" -m pip install -r "%SCRIPT_DIR%requirements-windows-vista.txt"
if errorlevel 1 exit /b 1

"%VENV_DIR%\Scripts\python.exe" revortana.py
