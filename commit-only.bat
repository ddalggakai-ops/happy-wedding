@echo off
cd /d "%~dp0"
echo.
echo === commit only (auto-push will push it) ===
echo.
if exist ".git\HEAD.lock"  del /f /q ".git\HEAD.lock"
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist "assets\snap-lace.jpg" git rm -q -f "assets/snap-lace.jpg"
git add -A
git -c user.name="Hyunjin" -c user.email="ttykopi@gmail.com" commit -m "reorder gallery photos; parking notice wording" --author="Hyunjin <ttykopi@gmail.com>"
echo.
git log -1 --oneline
echo.
echo ---- committed. auto-push will send it within a minute. ----
pause >nul
