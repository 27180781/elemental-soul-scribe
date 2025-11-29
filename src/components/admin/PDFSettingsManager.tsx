import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { PDFSettings } from "@/types/personality";
import PDFPreview from "./PDFPreview";

const DEFAULT_PDF_SETTINGS: PDFSettings = {
  contentTop: 180,
  contentLeft: 60,
  contentRight: 60,
  contentBottom: 120,
  headerMarginBottom: 30,
  titleFontSize: 36,
  nameFontSize: 24,
  chartWidth: 400,
  chartHeight: 300,
  chartMarginTop: 20,
  chartMarginBottom: 20,
  chartCanvasWidth: 600,
  chartCanvasHeight: 400,
  chartPercentageFontSize: 24,
  legendMarginTop: 15,
  legendGap: 20,
  legendFontSize: 16,
  legendBoxSize: 20,
  personalityMarginTop: 20,
  personalityPadding: 20,
  personalityBorderRadius: 16,
  personalityMaxWidth: 600,
  personalityTitleFontSize: 22,
  personalityTextFontSize: 16,
  personalityLineHeight: 1.7,
};

const PDFSettingsManager = () => {
  const { pdfSettings, setPdfSettings, resetPDFSettings } = useData();

  const handleChange = (field: keyof PDFSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setPdfSettings({
        ...pdfSettings,
        [field]: numValue,
      });
    }
  };

  const handleSave = () => {
    toast.success("הגדרות PDF נשמרו");
  };

  const handleReset = () => {
    resetPDFSettings();
    toast.success("הגדרות PDF אופסו לברירת המחדל");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Panel */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">הגדרות עיצוב PDF</h2>
            <p className="text-muted-foreground">התאם את מיקום, גודל וריווחים של אלמנטים ב-PDF</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            אפס להגדרות ברירת מחדל
          </Button>
          <Button onClick={handleSave} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            שמור
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Container Position */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">מיקום מיכל התוכן (מרחקים מקצוות הדף)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentTop">מרחק מלמעלה (px)</Label>
                <Input
                  id="contentTop"
                  type="number"
                  value={pdfSettings.contentTop}
                  onChange={(e) => handleChange('contentTop', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentBottom">מרחק מלמטה (px)</Label>
                <Input
                  id="contentBottom"
                  type="number"
                  value={pdfSettings.contentBottom}
                  onChange={(e) => handleChange('contentBottom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentRight">מרחק מימין (px)</Label>
                <Input
                  id="contentRight"
                  type="number"
                  value={pdfSettings.contentRight}
                  onChange={(e) => handleChange('contentRight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentLeft">מרחק משמאל (px)</Label>
                <Input
                  id="contentLeft"
                  type="number"
                  value={pdfSettings.contentLeft}
                  onChange={(e) => handleChange('contentLeft', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Header Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">כותרת (מספר משתתף + שם)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleFontSize">גודל פונט מספר משתתף</Label>
                <Input
                  id="titleFontSize"
                  type="number"
                  value={pdfSettings.titleFontSize}
                  onChange={(e) => handleChange('titleFontSize', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameFontSize">גודל פונט שם משתתף</Label>
                <Input
                  id="nameFontSize"
                  type="number"
                  value={pdfSettings.nameFontSize}
                  onChange={(e) => handleChange('nameFontSize', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerMarginBottom">ריווח תחתון (מרחק לתרשים)</Label>
                <Input
                  id="headerMarginBottom"
                  type="number"
                  value={pdfSettings.headerMarginBottom}
                  onChange={(e) => handleChange('headerMarginBottom', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Chart Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">תרשים עוגה תלת-ממדי</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chartWidth">רוחב תצוגה (px)</Label>
                <Input
                  id="chartWidth"
                  type="number"
                  value={pdfSettings.chartWidth}
                  onChange={(e) => handleChange('chartWidth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartHeight">גובה תצוגה (px)</Label>
                <Input
                  id="chartHeight"
                  type="number"
                  value={pdfSettings.chartHeight}
                  onChange={(e) => handleChange('chartHeight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartCanvasWidth">רוחב רזולוציה</Label>
                <Input
                  id="chartCanvasWidth"
                  type="number"
                  value={pdfSettings.chartCanvasWidth}
                  onChange={(e) => handleChange('chartCanvasWidth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartCanvasHeight">גובה רזולוציה</Label>
                <Input
                  id="chartCanvasHeight"
                  type="number"
                  value={pdfSettings.chartCanvasHeight}
                  onChange={(e) => handleChange('chartCanvasHeight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartMarginTop">ריווח עליון (מכותרת)</Label>
                <Input
                  id="chartMarginTop"
                  type="number"
                  value={pdfSettings.chartMarginTop}
                  onChange={(e) => handleChange('chartMarginTop', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartMarginBottom">ריווח תחתון (למקרא)</Label>
                <Input
                  id="chartMarginBottom"
                  type="number"
                  value={pdfSettings.chartMarginBottom}
                  onChange={(e) => handleChange('chartMarginBottom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartPercentageFontSize">גודל פונט אחוזים</Label>
                <Input
                  id="chartPercentageFontSize"
                  type="number"
                  value={pdfSettings.chartPercentageFontSize}
                  onChange={(e) => handleChange('chartPercentageFontSize', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Legend Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">מקרא (יסודות)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legendMarginTop">ריווח עליון (מתרשים)</Label>
                <Input
                  id="legendMarginTop"
                  type="number"
                  value={pdfSettings.legendMarginTop}
                  onChange={(e) => handleChange('legendMarginTop', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legendGap">ריווח בין פריטים</Label>
                <Input
                  id="legendGap"
                  type="number"
                  value={pdfSettings.legendGap}
                  onChange={(e) => handleChange('legendGap', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legendFontSize">גודל פונט טקסט</Label>
                <Input
                  id="legendFontSize"
                  type="number"
                  value={pdfSettings.legendFontSize}
                  onChange={(e) => handleChange('legendFontSize', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legendBoxSize">גודל ריבוע צבע</Label>
                <Input
                  id="legendBoxSize"
                  type="number"
                  value={pdfSettings.legendBoxSize}
                  onChange={(e) => handleChange('legendBoxSize', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Personality Box Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">תיבת ניתוח אישיות</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalityMarginTop">ריווח עליון (ממקרא)</Label>
                <Input
                  id="personalityMarginTop"
                  type="number"
                  value={pdfSettings.personalityMarginTop}
                  onChange={(e) => handleChange('personalityMarginTop', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalityPadding">ריפוד פנימי</Label>
                <Input
                  id="personalityPadding"
                  type="number"
                  value={pdfSettings.personalityPadding}
                  onChange={(e) => handleChange('personalityPadding', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalityBorderRadius">עיגול פינות</Label>
                <Input
                  id="personalityBorderRadius"
                  type="number"
                  value={pdfSettings.personalityBorderRadius}
                  onChange={(e) => handleChange('personalityBorderRadius', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalityMaxWidth">רוחב מקסימלי</Label>
                <Input
                  id="personalityMaxWidth"
                  type="number"
                  value={pdfSettings.personalityMaxWidth}
                  onChange={(e) => handleChange('personalityMaxWidth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalityTitleFontSize">גודל פונט כותרת</Label>
                <Input
                  id="personalityTitleFontSize"
                  type="number"
                  value={pdfSettings.personalityTitleFontSize}
                  onChange={(e) => handleChange('personalityTitleFontSize', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalityTextFontSize">גודל פונט תיאור</Label>
                <Input
                  id="personalityTextFontSize"
                  type="number"
                  value={pdfSettings.personalityTextFontSize}
                  onChange={(e) => handleChange('personalityTextFontSize', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalityLineHeight">גובה שורה</Label>
                <Input
                  id="personalityLineHeight"
                  type="number"
                  step="0.1"
                  value={pdfSettings.personalityLineHeight}
                  onChange={(e) => handleChange('personalityLineHeight', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:sticky lg:top-6 h-fit">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">תצוגה מקדימה</h3>
          <div className="bg-muted rounded-lg p-4" style={{ minHeight: '600px' }}>
            <PDFPreview settings={pdfSettings} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PDFSettingsManager;
