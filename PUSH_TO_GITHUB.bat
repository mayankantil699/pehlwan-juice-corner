@echo off
title Pehlwan Juice Corner - Auto Push to GitHub
cd /d "d:\pehlwan-juice-corner"
set "PATH=C:\Users\Lenovo\MinGit\cmd;%PATH%"

echo ================================================================
echo        PEHLWAN JUICE CORNER - GITHUB AUTO DEPLOYER
echo ================================================================
echo.

echo [1/3] Checking GitHub connection...
gh auth status >nul 2>&1
if %errorlevel% equ 0 goto :already_logged_in

echo.
echo ----------------------------------------------------------------
echo GitHub account login karna hoga.
echo Abhi browser khulega, waha Authorize par click karein.
echo ----------------------------------------------------------------
echo.
gh auth login -h github.com -p https --web

:already_logged_in
echo.
echo [2/3] Preparing files...
git add -A
git commit -m "Update Pehlwan Juice Corner files" >nul 2>&1

echo.
echo [3/3] Uploading to GitHub...
gh repo create pehlwan-juice-corner --public --source=. --remote=origin --push
if %errorlevel% neq 0 (
    git push -u origin main
)

echo.
echo ================================================================
echo   SUCCESS! AAPKI WEBSITE KA CODE GITHUB PAR UPLOAD HO GAYA!
echo ================================================================
echo.
echo Ab Vercel par jayein:
echo 1. https://vercel.com/new kholiye
echo 2. pehlwan-juice-corner ke samne Import dabayein
echo 3. Deploy dabayein aur website live!
echo.
pause
