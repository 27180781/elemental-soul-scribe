#!/usr/bin/env bash
# הפעלת המערכת אופליין על macOS / Linux (בונה ומריץ)
# Run the app offline on macOS / Linux (build + launch)
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[שגיאה] Node.js לא מותקן. התקן מ: https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "מתקין רכיבים (פעם ראשונה - דורש אינטרנט)..."
  npm install
fi

echo "בונה את האפליקציה..."
npm run build

echo "פותח את האפליקציה..."
npm run electron
