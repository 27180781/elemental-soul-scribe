

# תיקון שתי בעיות ב-PDF: מספר משתתף הפוך וסדר פסקאות משובש

## בעיה 1: "משתתף מספר 301" במקום "103"

**שורש הבעיה**: הפונקציה `reverseHebrew` הופכת את סדר כל הסגמנטים (כולל מספרים), אבל לא הופכת את התווים בתוך מספרים. כיוון ש-jsPDF מצייר שמאל-לימין אבל הקורא קורא מימין-לשמאל, המספר "103" שנשאר כפי שהוא הופך ויזואלית ל-"301".

**פתרון**: להפוך גם את ספרות המספרים (בדיוק כמו מילים עבריות), כי הם עוברים את אותו היפוך ויזואלי.

## בעיה 2: סדר פסקאות ורווחים משובשים בתיאור האישיות

**שורש הבעיה**: הקוד מפעיל `reverseHebrew` על כל הטקסט של התיאור לפני ש-`splitTextToSize` מפצל אותו לשורות:

```text
reverseHebrew(כל הטקסט) -> splitTextToSize -> שורות
```

זה גורם לכך שהמילים האחרונות של הטקסט המקורי מופיעות בשורה הראשונה, והמילים הראשונות מופיעות בשורה האחרונה - הטקסט מתחיל מהסוף.

**פתרון**: קודם לפצל את הטקסט המקורי לשורות, ואז להפעיל `reverseHebrew` על כל שורה בנפרד:

```text
splitTextToSize(טקסט מקורי) -> reverseHebrew(כל שורה) -> שורות תקינות
```

## שינויים טכניים

### קובץ: `src/utils/pdfGenerator.ts`

**שינוי 1 - פונקציית `reverseHebrew` (שורות 148-164):**
הוספת היפוך תווים גם למספרים:

```ts
return reversed.map(seg => {
  if (/[\u0590-\u05FF]/.test(seg) || /^[0-9]+$/.test(seg)) {
    return seg.split('').reverse().join('');
  }
  return seg;
}).join('');
```

**שינוי 2 - תיאור האישיות (שורות 455-463):**
שינוי הסדר - קודם פיצול לשורות, אז היפוך כל שורה:

```ts
// לפני (שגוי):
const descText = reverseHebrew(description);
const descLines = pdf.splitTextToSize(descText, descMaxWidth);

// אחרי (תקין):
const rawLines = pdf.splitTextToSize(description, descMaxWidth);
const descLines = rawLines.map(line => reverseHebrew(line));
```

## קבצים לעדכון

| קובץ | שינוי |
|-------|--------|
| `src/utils/pdfGenerator.ts` | 1. הוספת היפוך מספרים ב-`reverseHebrew` 2. שינוי סדר פעולות בתיאור האישיות |

