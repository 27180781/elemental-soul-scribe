

# תיקון פונקציית reverseHebrew לתמיכה נכונה ב-RTL

## הבעיה

הפונקציה `reverseHebrew` הנוכחית כוללת רווחים (`\s`) בתוך הקבוצה של תווים עבריים בביטוי הרגולרי:
```
/[\u0590-\u05FF\s]+/
```

זה גורם לכך שמשפט שלם כמו "את יצירתית חברותית ורגישה" נחשב כבלוק אחד, ואז היפוך תו-תו שלו מייצר שטויות כמו "השיגרו תיתורבח תיתריצי תא".

## הפתרון

לשכתב את `reverseHebrew` כך שתפרק את הטקסט לרצפים נפרדים: מילים עבריות, מספרים, רווחים, סימני פיסוק - כל אחד בנפרד.

### האלגוריתם הנכון:
1. פירוק הטקסט לרצפים: עברית | מספרים | לטינית | רווחים | פיסוק
2. היפוך סדר הרצפים (כי הכיוון הבסיסי הוא RTL)
3. היפוך תווים בתוך כל רצף עברי בלבד (כי jsPDF מצייר שמאל-לימין)
4. מספרים ולטינית נשארים כפי שהם

### דוגמה:
- קלט: `"את יצירתית, חברותית ורגישה."`
- רצפים: `["את", " ", "יצירתית", ",", " ", "חברותית", " ", "ורגישה", "."]`
- היפוך סדר: `[".", "ורגישה", " ", "חברותית", " ", ",", "יצירתית", " ", "את"]`
- היפוך תווים עבריים: `[".", "השיגרו", " ", "תיתורבח", " ", ",", "תיתריצי", " ", "תא"]`
- jsPDF מצייר שמאל-לימין, קריאה מימין-לשמאל: **"את יצירתית, חברותית ורגישה."**

## שינוי טכני

### קובץ: `src/utils/pdfGenerator.ts`

שורות 148-161 - החלפת הפונקציה `reverseHebrew`:

**לפני:**
```ts
const reverseHebrew = (text: string): string => {
  const segments = text.match(/[\u0590-\u05FF\s]+|[^\u0590-\u05FF\s]+/g) || [text];
  const processed = segments.map(seg => {
    if (/[\u0590-\u05FF]/.test(seg)) {
      return seg.split('').reverse().join('');
    }
    return seg;
  });
  return processed.reverse().join('');
};
```

**אחרי:**
```ts
const reverseHebrew = (text: string): string => {
  // Split into fine-grained runs: Hebrew words, numbers, latin, whitespace, punctuation
  const segments = text.match(
    /[\u0590-\u05FF]+|[0-9]+|[a-zA-Z]+|[\s]+|[^\u0590-\u05FFa-zA-Z0-9\s]+/g
  ) || [text];

  // Reverse segment order (RTL base direction)
  const reversed = [...segments].reverse();

  // Reverse characters only within Hebrew runs (jsPDF draws LTR)
  return reversed.map(seg => {
    if (/[\u0590-\u05FF]/.test(seg)) {
      return seg.split('').reverse().join('');
    }
    return seg;
  }).join('');
};
```

ההבדל המרכזי: הרווחים (`\s`) כבר לא מקובצים עם אותיות עבריות, וסימני פיסוק (נקודה, פסיק) מופרדים כרצפים עצמאיים. כך כל מילה עברית מטופלת בנפרד.

## קבצים לעדכון

| קובץ | שינוי |
|-------|--------|
| `src/utils/pdfGenerator.ts` | שכתוב פונקציית `reverseHebrew` בלבד (שורות 148-161) |

