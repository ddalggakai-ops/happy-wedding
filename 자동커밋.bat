@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"
title auto-commit
echo ================================================
echo  [auto-commit] Do not close this window.
echo  Watches for commit-request.txt every 15s.
echo  Claude writes that file; this window commits it.
echo ================================================
echo.
:loop
if not exist "commit-request.txt" goto wait

set "MSG="
set /p MSG=<commit-request.txt
if "!MSG!"=="" set "MSG=update"
del /f /q "commit-request.txt"

if exist ".git\HEAD.lock"  del /f /q ".git\HEAD.lock"
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist "assets\snap-lace.jpg" git rm -q -f "assets/snap-lace.jpg"

git add -A
git -c user.name="Hyunjin" -c user.email="ttykopi@gmail.com" commit -m "!MSG!" --author="Hyunjin <ttykopi@gmail.com>"
echo.
echo --- %DATE% %TIME% ---
echo.

:wait
timeout /t 15 /nobreak >nul
goto loop
