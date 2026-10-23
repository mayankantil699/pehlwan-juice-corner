@echo off
title Pehlwan Juice Corner - Auto Push to GitHub
cd /d "d:\pehlwan-juice-corner"
set PATH=C:\Users\Lenovo\MinGit\cmd;%PATH%

echo ================================================================
echo        PEHLWAN JUICE CORNER - GITHUB AUTO DEPLOYER
echo ================================================================
echo.

echo [1/3] Checking GitHub connection...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------------------
    echo GitHub account login karna hoga (One-Time Step).
    echo Abhi ek Browser khulega, waha 'Authorize github' par click karein.
    echo ----------------------------------------------------------------
    echo.
    gh auth login -h github.com -p https --web
)

echo.
echo [2/3] Preparing repository...
git add .
git commit -m "Update Pehlwan Juice Corner website" >nul 2>&1

echo.
echo [3/3] Uploading code to your GitHub account...
gh repo create pehlwan-juice-corner --public --source=. --remote=origin --push
if %errorlevel% neq 0 (
    echo Repo already exists on your account, pushing latest updates...
    git push -u origin main
)

echo.
echo ================================================================
echo   SUCCESS! AAPKI WEBSITE KA CODE GITHUB PAR UPLOAD HO GAYA!
echo ================================================================
echo.
echo Ab bas Vercel par jana hai:
echo 1. https://vercel.com/new par jayein
echo 2. 'pehlwan-juice-corner' ke aage 'Import' dabayein
echo 3. 'Deploy' dabayein aur website live!
echo.
pause
