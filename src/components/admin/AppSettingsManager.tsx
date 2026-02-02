import { useData } from "@/contexts/DataContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { AppSettings } from "@/types/personality";

const DEFAULT_APP_SETTINGS: AppSettings = {
  concentrationThreshold: 10,
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
    </div>
  );
};

export default AppSettingsManager;