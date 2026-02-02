

# תכנית: זירוז יצירת PDF באמצעות עיבוד מקבילי

## סקירה כללית

הוספת מנגנון עיבוד מקבילי ליצירת קבצי PDF שיאפשר עיבוד מספר משתתפים בו-זמנית במקום אחד אחרי השני. מספר המנועים המקבילים יהיה ניתן להגדרה בהגדרות המערכת.

## שינויים טכניים

### 1. עדכון טיפוסים (src/types/personality.ts)

הוספת שדה חדש ל-`AppSettings`:

```typescript
export interface AppSettings {
  concentrationThreshold: number;
  batchPdfSize: number;
  parallelPdfWorkers: number; // חדש - מספר מנועי PDF מקבילים (1-5)
}
```

### 2. עדכון DataContext (src/contexts/DataContext.tsx)

עדכון ברירת המחדל:

```typescript
const DEFAULT_APP_SETTINGS: AppSettings = {
  concentrationThreshold: 10,
  batchPdfSize: 10,
  parallelPdfWorkers: 3, // ברירת מחדל: 3 מנועים
};
```

### 3. שכתוב pdfGenerator.ts (src/utils/pdfGenerator.ts)

#### פונקציית עיבוד מקבילי חדשה:

```typescript
const processInParallel = async <T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T, index: number) => Promise<R>,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let completed = 0;
  let currentIndex = 0;

  const processNext = async (): Promise<void> => {
    const index = currentIndex++;
    if (index >= items.length) return;
    
    results[index] = await processor(items[index], index);
    completed++;
    onProgress?.(completed, items.length);
    
    await processNext();
  };

  // הפעלת מספר workers במקביל
  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
};
```

#### עדכון generateAllPDFs:

```typescript
export const generateAllPDFs = async (
  profiles: ParticipantProfile[],
  personalityTypes: PersonalityType[],
  settings: PDFSettings,
  batchSize: number = 10,
  parallelWorkers: number = 3, // פרמטר חדש
  onProgress?: (current: number, total: number, stage: string) => void
): Promise<void> => {
  const batches = splitIntoBatches(profiles, batchSize);
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    
    // שלב 1: יצירת HTML elements (מהיר)
    const elements = batch.map(profile => {
      const element = createProfileHTML(profile, personalityTypes, settings);
      document.body.appendChild(element);
      return { profile, element };
    });
    
    // שלב 2: המרה לתמונות במקביל
    const canvasResults = await processInParallel(
      elements,
      parallelWorkers,
      async ({ element }, index) => {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        onProgress?.(
          batchIndex * batchSize + index + 1, 
          profiles.length, 
          'ממיר לתמונה'
        );
        return canvas;
      }
    );
    
    // ניקוי DOM
    elements.forEach(({ element }) => document.body.removeChild(element));
    
    // שלב 3: הרכבת PDF (מהיר)
    canvasResults.forEach((canvas, index) => {
      if (index > 0) pdf.addPage();
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    });
    
    // שמירת הקובץ
    const startNum = batchIndex * batchSize + 1;
    const endNum = Math.min((batchIndex + 1) * batchSize, profiles.length);
    pdf.save(`personality-profiles-${startNum}-${endNum}.pdf`);
    
    // המתנה קצרה בין batches
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
};
```

### 4. עדכון AppSettingsManager (src/components/admin/AppSettingsManager.tsx)

הוספת שדה הגדרה חדש:

```tsx
<div className="space-y-2">
  <Label htmlFor="parallelWorkers">
    מספר מנועי PDF מקבילים
  </Label>
  <p className="text-sm text-muted-foreground">
    מספר התהליכים שיעבדו במקביל ביצירת PDF. 
    במחשבים חזקים ניתן להגדיר 4-5, במחשבים חלשים מומלץ 1-2.
  </p>
  <Input
    id="parallelWorkers"
    type="number"
    min={1}
    max={5}
    value={settings.parallelPdfWorkers}
    onChange={(e) => setSettings({
      ...settings,
      parallelPdfWorkers: Number(e.target.value)
    })}
  />
  <div className="flex gap-2 text-xs text-muted-foreground">
    <span>1 = איטי אך יציב</span>
    <span>•</span>
    <span>5 = מהיר אך דורש מחשב חזק</span>
  </div>
</div>
```

### 5. עדכון Results.tsx (src/pages/Results.tsx)

#### שיפור Progress Indicator:

```tsx
const [pdfProgress, setPdfProgress] = useState({
  current: 0,
  total: 0,
  stage: '',
  isGenerating: false
});

const handleDownloadAll = async () => {
  setPdfProgress({ current: 0, total: profiles.length, stage: 'מתחיל...', isGenerating: true });
  
  await generateAllPDFs(
    profiles,
    personalityTypes,
    pdfSettings,
    appSettings.batchPdfSize,
    appSettings.parallelPdfWorkers,
    (current, total, stage) => {
      setPdfProgress({ current, total, stage, isGenerating: true });
    }
  );
  
  setPdfProgress(prev => ({ ...prev, isGenerating: false }));
};

// תצוגת התקדמות משופרת
{pdfProgress.isGenerating && (
  <div className="space-y-2 p-4 border rounded-lg">
    <div className="flex justify-between text-sm">
      <span>{pdfProgress.stage}</span>
      <span>{pdfProgress.current} / {pdfProgress.total}</span>
    </div>
    <Progress value={(pdfProgress.current / pdfProgress.total) * 100} />
    <p className="text-xs text-muted-foreground text-center">
      {Math.round((pdfProgress.current / pdfProgress.total) * 100)}% הושלם
    </p>
  </div>
)}
```

## תרשים זרימה

```text
לחיצה על "הורד הכל"
         |
         v
+------------------+
|  חלוקה ל-Batches |
|  (לפי batchSize) |
+------------------+
         |
         v
+------------------+
|  עבור כל Batch:  |
+------------------+
         |
         v
+------------------+
|  יצירת HTML      |
|  (כל המשתתפים)   |
+------------------+
         |
         v
+------------------------+
|  המרה לתמונות          |
|  במקביל                |
|  (parallelWorkers)     |
|                        |
|  Worker 1: משתתף 1    |
|  Worker 2: משתתף 2    |
|  Worker 3: משתתף 3    |
|  ...                   |
+------------------------+
         |
         v
+------------------+
|  הרכבת PDF       |
|  ושמירה          |
+------------------+
         |
         v
+------------------+
|  Batch הבא       |
+------------------+
```

## השוואת ביצועים משוערת

| מספר משתתפים | סדרתי (1 worker) | 3 workers | 5 workers |
|--------------|------------------|-----------|-----------|
| 10           | ~20 שניות        | ~8 שניות  | ~5 שניות  |
| 30           | ~60 שניות        | ~22 שניות | ~14 שניות |
| 100          | ~200 שניות       | ~70 שניות | ~45 שניות |

## קבצים לעדכון

1. **src/types/personality.ts** - הוספת `parallelPdfWorkers`
2. **src/contexts/DataContext.tsx** - עדכון ברירת מחדל
3. **src/utils/pdfGenerator.ts** - מנגנון עיבוד מקבילי
4. **src/components/admin/AppSettingsManager.tsx** - הגדרת מספר מנועים
5. **src/pages/Results.tsx** - Progress indicator משופר

