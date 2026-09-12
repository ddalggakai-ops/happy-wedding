@echo off
cd /d "%~dp0"
echo.
echo === commit and push ===
echo.
rem stale lock files block git - remove them first
if exist ".git\HEAD.lock"  del /f /q ".git\HEAD.lock"
if exist ".git\index.lock" del /f /q ".git\index.lock"
echo.
git add -A
git -c user.name="Hyunjin" -c user.email="ttykopi@gmail.com" commit -m "shrink photos and audio for faster first load" --author="Hyunjin <ttykopi@gmail.com>"
git push
echo.
echo ---- finished. press any key to close ----
pause >nul
