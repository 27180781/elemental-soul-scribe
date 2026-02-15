

# תיקון הורדת PDF באופליין - נתיבי גופנים

## הבעיה

בקובץ `src/utils/pdfGenerator.ts`, שורות 113-114, הגופנים נטענים עם נתיבים מוחלטים:

```ts
fetchAndConvert('/fonts/kanuba-regular.woff'),
fetchAndConvert('/fonts/kanuba-bold.woff'),
```

בסביבת Electron או כל גישה דרך `file://`, נתיב מוחלט כמו `/fonts/...` מפנה לשורש מערכת הקבצים במקום לתיקיית האפליקציה -- וכתוצאה מכך ה-fetch נכשל.

## הפתרון

שינוי הנתיבים לנתיבים יחסיים (`./fonts/...`), בהתאמה להגדרת `base: "./"` שכבר קיימת ב-Vite config:

```ts
fetchAndConvert('./fonts/kanuba-regular.woff'),
fetchAndConvert('./fonts/kanuba-bold.woff'),
```

## שינויים טכניים

### קובץ: `src/utils/pdfGenerator.ts`

| שורה | לפני | אחרי |
|-------|-------|-------|
| 113 | `fetchAndConvert('/fonts/kanuba-regular.woff')` | `fetchAndConvert('./fonts/kanuba-regular.woff')` |
| 114 | `fetchAndConvert('/fonts/kanuba-bold.woff')` | `fetchAndConvert('./fonts/kanuba-bold.woff')` |

שינוי של 2 תווים בלבד (הוספת נקודה לפני כל `/`). ללא שינויים נוספים.
