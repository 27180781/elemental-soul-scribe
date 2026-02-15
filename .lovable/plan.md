

# תיקון היפוך מספרים ב-reverseHebrew

## הבעיה

הפונקציה `reverseHebrew` מפעילה היפוך תווים על כל מספר, בין אם הוא חלק משורה עברית ובין אם הוא עומד לבד:

- **שורה מעורבת** (עברית + מספר): `"משתתף מספר 103"` - היפוך הסגמנטים הופך את סדר ה-"103", אז צריך להפוך את הספרות חזרה כדי שזה ייקרא נכון. **היפוך ספרות = נכון.**
- **שורה עם מספר בלבד**: `"103"` - אין היפוך סגמנטים משמעותי (סגמנט יחיד), אז היפוך הספרות הופך את "103" ל-"301". **היפוך ספרות = שגוי.**

## הפתרון

להפעיל היפוך ספרות רק כשהשורה מכילה גם טקסט עברי. אם אין עברית בשורה, המספרים נשארים כמו שהם.

## שינוי טכני

### קובץ: `src/utils/pdfGenerator.ts` (שורות 148-164)

```ts
const reverseHebrew = (text: string): string => {
  const segments = text.match(
    /[\u0590-\u05FF]+|[0-9]+|[a-zA-Z]+|[\s]+|[^\u0590-\u05FFa-zA-Z0-9\s]+/g
  ) || [text];

  // Check if the text contains any Hebrew characters
  const hasHebrew = /[\u0590-\u05FF]/.test(text);

  // Reverse segment order (RTL base direction)
  const reversed = [...segments].reverse();

  // Reverse characters within Hebrew runs always;
  // Reverse digits only when mixed with Hebrew text
  return reversed.map(seg => {
    if (/[\u0590-\u05FF]/.test(seg)) {
      return seg.split('').reverse().join('');
    }
    if (hasHebrew && /^[0-9]+$/.test(seg)) {
      return seg.split('').reverse().join('');
    }
    return seg;
  }).join('');
};
```

ההבדל היחיד: התנאי `hasHebrew &&` לפני היפוך ספרות - מספרים מתהפכים רק כשהם חלק משורה שמכילה עברית.

| קובץ | שינוי |
|-------|--------|
| `src/utils/pdfGenerator.ts` | הוספת תנאי `hasHebrew` להיפוך ספרות בפונקציית `reverseHebrew` |

