@echo off
cd /d "%~dp0"
echo.
echo === commit and push ===
echo.
if exist ".git\HEAD.lock"  del /f /q ".git\HEAD.lock"
if exist ".git\index.lock" del /f /q ".git\index.lock"
git add -A
git -c user.name="Hyunjin" -c user.email="ttykopi@gmail.com" commit -m "map links use full address; bold parking notes; friendlier info tabs; address copy button" --author="Hyunjin <ttykopi@gmail.com>"
git push
echo.
echo ---- finished. press any key to close ----
pause >nul
