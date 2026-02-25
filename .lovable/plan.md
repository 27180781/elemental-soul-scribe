# אופטימיזציית ביצועים - קאשינג תמונות מקרא (Legend) ב-pdfGenerator.ts

## ניתוח

ההצעה נכונה ומשמעותית. כרגע `createLegendPatternImage` נקראת 4 פעמים **בכל קריאה ל-`renderProfileToPDF**` (שורות 406-410). ב-500 משתתפים זה 2,000 יצירות קנבס + המרות JPEG, כשהתוצאה זהה לחלוטין בכל פעם.

לגבי מיחזור הקנבס של הגרף (`create3DPieChart`) - זה פחות קריטי כי כל גרף שונה (נתונים אחרים), ויצירת Canvas element היא פעולה זולה. אבל את המקרא אפשר לקאש בקלות.

## הפתרון

קאשינג של תמונות המקרא - ליצור אותן פעם אחת ולהשתמש מחדש בכל הדפים.

## שינויים טכניים

### קובץ: `src/utils/pdfGenerator.ts`

**1. הוספת משתנה cache ברמת המודול** (לפני `renderProfileToPDF`):

```ts
let cachedLegendItems: Array<{ name: string; patternImg: string }> | null = null;
```

**2. שינוי שורות 405-410** בתוך `renderProfileToPDF` - שימוש בקאש:

```ts
// Cache legend pattern images - identical for all participants
if (!cachedLegendItems) {
  const elementKeys: Array<'fire' | 'water' | 'air' | 'earth'> = ['fire', 'water', 'air', 'earth'];
  cachedLegendItems = elementKeys.map(key => ({
    name: ELEMENT_NAMES[key],
    patternImg: createLegendPatternImage(ELEMENT_PATTERNS[key].pattern, ELEMENT_PATTERNS[key].fill, 40),
  }));
}
const legendItems = cachedLegendItems;
```


| קובץ                        | שינוי                                                                   |
| --------------------------- | ----------------------------------------------------------------------- |
| `src/utils/pdfGenerator.ts` | הוספת `cachedLegendItems` cache + שימוש חוזר במקום יצירה מחדש בכל קריאה |


**חיסכון**: מ-2,000 יצירות קנבס (500 משתתפים × 4) → 4 יצירות בלבד.

שים לב שאת המשתנה:

let cachedLegendItems: Array<{ name: string; patternImg: string }> | null = null;

חשוב לשים **מחוץ** לפונקציה `renderProfileToPDF` (למשל, ממש מעליה, איפה שמוגדרים `FONT_NAME` ו-`ELEMENT_NAMES`), בדיוק כמו שתכננת, כדי שהערך שלו יישמר בין קריאות שונות לפונקציה.