@echo off
echo Starting Templi development server...
echo.
echo Setting environment variables to prevent content decoding errors...
set PORT=3000
set GENERATE_SOURCEMAP=false
set BROWSER=none
echo.
echo Starting React development server...
npm start
pause