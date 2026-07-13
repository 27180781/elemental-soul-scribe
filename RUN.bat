@echo off
chcp 65001 >nul
title מערכת ניתוח אישיות - הפעלה
echo ============================================================
echo    הפעלת המערכת על המחשב (אופליין)
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [שגיאה] Node.js לא מותקן במחשב.
    echo יש להתקין פעם אחת מ:  https://nodejs.org  (גרסת LTS)
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo מתקין רכיבים (פעם ראשונה בלבד - דורש חיבור לאינטרנט)...
    call npm install
    if errorlevel 1 (
        echo [שגיאה] התקנת הרכיבים נכשלה.
        pause
        exit /b 1
    )
)

echo בונה את האפליקציה...
call npm run build
if errorlevel 1 (
    echo [שגיאה] הבנייה נכשלה.
    pause
    exit /b 1
)

echo פותח את האפליקציה... (החלון השחור הזה יישאר פתוח כל עוד המערכת רצה)
call npm run electron
pause
