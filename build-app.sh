#!/usr/bin/env bash
# בניית אפליקציית שולחן עבודה אופליין עבור macOS / Linux
# Build the offline desktop app for macOS / Linux
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[שגיאה] Node.js לא מותקן. התקן מ: https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "[1/2] מתקין רכיבים (פעם ראשונה - דורש אינטרנט)..."
  npm install
else
  echo "[1/2] הרכיבים כבר מותקנים - מדלג."
fi

echo "[2/2] בונה את האפליקציה..."
npm run electron:build

echo ""
echo "הצלחה! קבצי ההפעלה מוכנים בתיקייה: release/"
