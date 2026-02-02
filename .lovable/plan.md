
# תכנית: התאמת האפליקציה לריצה אופליין עם Electron

## סקירת הבעיות

זיהיתי 3 בעיות עיקריות שגורמות ל-404 ולבעיות אחרות באופליין:

### בעיה 1: BrowserRouter לא עובד ב-Electron
`BrowserRouter` משתמש ב-History API שדורש שרת. ב-Electron (קבצים מקומיים) צריך להשתמש ב-`HashRouter`.

### בעיה 2: נתיב `/src/main.tsx` ב-index.html
הנתיב `/src/main.tsx` עובד רק בפיתוח. ב-Production Build התיקייה `/src` לא קיימת.

### בעיה 3: נתיבי פונטים אבסולוטיים
הפונטים מוגדרים עם נתיב `/fonts/...` שלא עובד כאשר הקובץ נטען מהדיסק.

## שינויים נדרשים

### 1. החלפת BrowserRouter ב-HashRouter (src/App.tsx)

**לפני:**
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
...
<BrowserRouter>
  <Routes>
    ...
  </Routes>
</BrowserRouter>
```

**אחרי:**
```tsx
import { HashRouter, Routes, Route } from "react-router-dom";
...
<HashRouter>
  <Routes>
    ...
  </Routes>
</HashRouter>
```

**ההבדל:** עם HashRouter הנתיבים יהיו `/#/`, `/#/admin`, `/#/results` - וזה עובד גם מקובץ מקומי.

### 2. הוספת base לנתיבים ב-Vite (vite.config.ts)

```typescript
export default defineConfig(({ mode }) => ({
  base: './', // נתיבים יחסיים
  server: {
    host: "::",
    port: 8080,
  },
  ...
}));
```

### 3. תיקון נתיבי הפונטים ב-CSS (src/index.css)

**לפני:**
```css
src: url('/fonts/kanuba-light.woff') format('woff');
```

**אחרי:**
```css
src: url('./fonts/kanuba-light.woff') format('woff');
```

### 4. תיקון נתיב הסקריפט ב-index.html (ידני)

הנתיב `/src/main.tsx` ב-`index.html` מטופל אוטומטית על ידי Vite בזמן build - אבל רק אם משתמשים בנתיב יחסי. בעיה זו כבר מתוקנת עם הוספת `base: './'`.

## קבצים לעדכון

| קובץ | שינוי |
|------|-------|
| `src/App.tsx` | החלפת BrowserRouter ב-HashRouter |
| `vite.config.ts` | הוספת `base: './'` |
| `src/index.css` | תיקון נתיבי פונטים ליחסיים |

## הערות טכניות

### למה HashRouter?
- `BrowserRouter` משתמש ב-`history.pushState()` שדורש שרת HTTP
- `HashRouter` משתמש ב-hash (`#`) בכתובת שעובד גם מ-`file://`
- הנתיבים יראו כך: `index.html#/admin` במקום `/admin`

### למה `base: './'`?
- מבטיח שכל הנתיבים ל-assets (JS, CSS, fonts) יהיו יחסיים
- במקום `/assets/index.js` יהיה `./assets/index.js`
- הכרחי לריצה מקובץ מקומי

### Build לאחר השינויים
לאחר השינויים, הרץ:
```bash
npm run build
```
ותיקיית `dist` תכיל קבצים שעובדים אופליין.

## תרשים ההבדל

```text
לפני (לא עובד אופליין):
  file:///C:/app/index.html
       |
       v
  BrowserRouter מחפש: /admin
       |
       v
  404! הנתיב /admin לא קיים במערכת הקבצים

אחרי (עובד אופליין):
  file:///C:/app/index.html#/admin
       |
       v
  HashRouter קורא את: #/admin
       |
       v
  מציג את דף Admin!
```
