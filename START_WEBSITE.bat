@echo off
title Pehlwan Juice Corner Server
cd /d "d:\pehlwan-juice-corner"
echo ========================================================
echo   Pehlwan Juice Corner - Localhost Server
echo   Israna, Near Punjab National Bank (Panipat)
echo ========================================================
echo.
echo Website starting at: http://localhost:5000
echo.
python app.py
if %errorlevel% neq 0 (
    echo Error starting server! Please make sure Python is installed.
    pause
)
