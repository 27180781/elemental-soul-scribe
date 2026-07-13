@echo off
chcp 65001 >nul
title בניית מערכת ניתוח אישיות - קובץ הפעלה למחשב
echo ============================================================
echo    בניית קובץ הפעלה (EXE) להתקנה אופליין על המחשב
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [שגיאה] Node.js לא מותקן במחשב.
    echo.
    echo יש להתקין פעם אחת מ:  https://nodejs.org
    echo לבחור בגרסת ה-LTS, להתקין, ואז להפעיל שוב את הקובץ הזה.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/2] מתקין רכיבים (פעם ראשונה בלבד - דורש חיבור לאינטרנט)...
    call npm install
    if errorlevel 1 (
        echo.
        echo [שגיאה] התקנת הרכיבים נכשלה. בדוק חיבור לאינטרנט ונסה שוב.
        pause
        exit /b 1
    )
) else (
    echo [1/2] הרכיבים כבר מותקנים - מדלג.
)

echo.
echo [2/2] בונה את קובץ ההפעלה...
call npm run electron:build
if errorlevel 1 (
    echo.
    echo [שגיאה] הבנייה נכשלה.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo    הצלחה! קבצי ההפעלה מוכנים בתיקייה: release
echo.
echo    - מתקין רגיל:      *Setup*.exe
echo    - גרסה ניידת:      ElementalSoulScribe-Portable.exe
echo      (רץ ישירות ללא התקנה - אפשר להעתיק ל-Disk-on-Key)
echo ============================================================
echo.
explorer release
pause
