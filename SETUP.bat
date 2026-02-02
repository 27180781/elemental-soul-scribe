@echo off
echo Running Electron Setup...
echo.

REM Try to find node
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js not found in PATH.
    echo Trying to use node from node_modules...
    
    if exist "node_modules\.bin\node.cmd" (
        node_modules\.bin\node.cmd setup-electron.js
    ) else if exist "node_modules\node\bin\node.exe" (
        node_modules\node\bin\node.exe setup-electron.js
    ) else (
        echo.
        echo ============================================
        echo ERROR: Node.js not found!
        echo ============================================
        echo.
        echo Please do ONE of the following:
        echo.
        echo OPTION 1 - Use VS Code ^(Recommended^):
        echo   1. Open this folder in VS Code
        echo   2. Press Ctrl+` to open terminal
        echo   3. Run: node setup-electron.js
        echo.
        echo OPTION 2 - Install Node.js:
        echo   1. Go to: https://nodejs.org/
        echo   2. Download and install LTS version
        echo   3. Run this file again
        echo.
        pause
        exit /b 1
    )
) else (
    node setup-electron.js
)

pause
