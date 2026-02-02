import { useData } from "@/contexts/DataContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Save, RotateCcw, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { AppSettings } from "@/types/personality";

const DEFAULT_APP_SETTINGS: AppSettings = {
  concentrationThreshold: 10,
  batchPdfSize: 10,
  parallelPdfWorkers: 3,
};

const AppSettingsManager = () => {
  const { appSettings, setAppSettings } = useData();
  const [localSettings, setLocalSettings] = useState<AppSettings>(appSettings);

  useEffect(() => {
    setLocalSettings(appSettings);
  }, [appSettings]);

  const handleSave = () => {
    setAppSettings(localSettings);
    toast.success("ההגדרות נשמרו בהצלחה");
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_APP_SETTINGS);
    setAppSettings(DEFAULT_APP_SETTINGS);
    toast.success("ההגדרות אופסו לברירת מחדל");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">הגדרות מערכת</h2>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            איפוס לברירת מחדל
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            שמור הגדרות
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            הגדרות התפלגות
          </CardTitle>
          <CardDescription>
            הגדרות הקשורות לזיהוי ריכוזיות גבוהה בהתפלגות סוגי האישיות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concentrationThreshold">סף אחוזים להתראת ריכוזיות (%)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="concentrationThreshold"
                type="number"
                min={1}
                max={100}
                value={localSettings.concentrationThreshold}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  concentrationThreshold: Math.max(1, Math.min(100, parseInt(e.target.value) || 10))
                })}
                className="w-32"
              />
              <span className="text-muted-foreground text-sm">
                התראה תוצג כאשר יותר מ-{localSettings.concentrationThreshold}% מהמשתתפים יקבלו את אותו סוג אישיות
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              ברירת מחדל: 10%. ערכים נמוכים יותר יציגו התראות בתדירות גבוהה יותר.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            הגדרות ייצוא PDF
          </CardTitle>
          <CardDescription>
            הגדרות הקשורות להורדת קבצי PDF מרובי משתתפים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="batchPdfSize">מספר משתתפים בכל קובץ PDF</Label>
            <div className="flex items-center gap-4">
              <Input
                id="batchPdfSize"
                type="number"
                min={1}
                max={100}
                value={localSettings.batchPdfSize}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  batchPdfSize: Math.max(1, Math.min(100, parseInt(e.target.value) || 10))
                })}
                className="w-32"
              />
              <span className="text-muted-foreground text-sm">
                בעת הורדת כל המשתתפים, המערכת תחלק ל-{localSettings.batchPdfSize} משתתפים בכל קובץ
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              ברירת מחדל: 10 משתתפים. ערכים נמוכים יותר יפיקו יותר קבצים קטנים.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parallelWorkers">מספר מנועי PDF מקבילים</Label>
            <div className="flex items-center gap-4">
              <Input
                id="parallelWorkers"
                type="number"
                min={1}
                max={5}
                value={localSettings.parallelPdfWorkers}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  parallelPdfWorkers: Math.max(1, Math.min(5, parseInt(e.target.value) || 3))
                })}
                className="w-32"
              />
              <span className="text-muted-foreground text-sm">
                מספר התהליכים שיעבדו במקביל ביצירת PDF
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              במחשבים חזקים ניתן להגדיר 4-5, במחשבים חלשים מומלץ 1-2. ברירת מחדל: 3.
            </p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>1 = איטי אך יציב</span>
              <span>•</span>
              <span>5 = מהיר אך דורש מחשב חזק</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettingsManager;