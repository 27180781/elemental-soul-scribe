import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, Sparkles, FileDown, Trash2, Home, AlertTriangle, Shuffle, BarChart3 } from "lucide-react";
import { generatePDF, generateAllPDFs } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ELEMENT_COLORS = {
  fire: "hsl(var(--fire))",
  water: "hsl(var(--water))",
  air: "hsl(var(--air))",
  earth: "hsl(var(--earth))",
};

const ELEMENT_NAMES = {
  fire: "אש",
  water: "מים",
  air: "רוח",
  earth: "עפר",
};

const Results = () => {
  const { participantProfiles, resetParticipantData, pdfSettings, distributionMode, setDistributionMode, personalityTypes } = useData();
  const navigate = useNavigate();

  // Calculate distribution statistics
  const distributionStats = useMemo(() => {
    if (!participantProfiles.length) return { stats: [], hasHighConcentration: false, maxPercentage: 0 };

    const counts: Record<string, { count: number; name: string; number: number }> = {};
    
    participantProfiles.forEach(profile => {
      if (profile.matchedPersonality) {
        const id = profile.matchedPersonality.id;
        if (!counts[id]) {
          counts[id] = { 
            count: 0, 
            name: profile.matchedPersonality.name || `אישיות ${profile.matchedPersonality.number}`,
            number: profile.matchedPersonality.number
          };
        }
        counts[id].count++;
      }
    });

    const totalParticipants = participantProfiles.length;
    const stats = Object.entries(counts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        number: data.number,
        count: data.count,
        percentage: (data.count / totalParticipants) * 100
      }))
      .sort((a, b) => b.count - a.count);

    const maxPercentage = stats.length > 0 ? stats[0].percentage : 0;
    const hasHighConcentration = maxPercentage > 10;

    return { stats, hasHighConcentration, maxPercentage };
  }, [participantProfiles]);

  const handleResetAll = () => {
    resetParticipantData();
    toast.success("נתוני המשתתפים נמחקו בהצלחה");
  };

  const handleToggleDistribution = () => {
    const newMode = distributionMode === 'normal' ? 'wide' : 'normal';
    setDistributionMode(newMode);
    toast.success(newMode === 'wide' ? 'עברנו להתפלגות רחבה' : 'חזרנו להתפלגות רגילה');
  };

  if (!participantProfiles.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">אין תוצאות זמינות</h2>
            <p className="text-muted-foreground">
              יש להעלות נתונים ולהגדיר מיפוי שאלות ואישיויות בלוח הבקרה
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-4 relative">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="absolute right-0 gap-2"
          >
            <Home className="h-4 w-4" />
            מסך ראשי
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-mystical bg-clip-text text-transparent">
              תוצאות ופרופילי אישיות
            </h1>
            <p className="text-muted-foreground">
              {participantProfiles.length} משתתפים נותחו
            </p>
          </div>
        </div>

        {/* High concentration alert */}
        {distributionStats.hasHighConcentration && distributionMode === 'normal' && (
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-right font-bold">ריכוזיות גבוהה זוהתה!</AlertTitle>
            <AlertDescription className="text-right">
              <span className="font-semibold">{distributionStats.maxPercentage.toFixed(1)}%</span> מהמשתתפים קיבלו את אותו סוג אישיות.
              ניתן להפעיל התפלגות רחבה לפיזור יותר מגוון.
            </AlertDescription>
          </Alert>
        )}

        {/* Distribution stats card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                סטטיסטיקת התפלגות
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-3 py-1 rounded-full ${distributionMode === 'wide' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {distributionMode === 'wide' ? 'התפלגות רחבה' : 'התפלגות רגילה'}
                </span>
                <Button
                  onClick={handleToggleDistribution}
                  variant={distributionMode === 'wide' ? 'outline' : 'default'}
                  size="sm"
                  className="gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  {distributionMode === 'wide' ? 'חזור להתפלגות רגילה' : 'עבור להתפלגות רחבה'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {distributionStats.stats.map((stat) => (
                <div 
                  key={stat.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${stat.percentage > 10 ? 'border-destructive bg-destructive/5' : 'border-border'}`}
                >
                  <div className="text-right">
                    <span className="font-medium">#{stat.number}</span>
                    {stat.name !== `אישיות ${stat.number}` && (
                      <span className="text-muted-foreground text-sm mr-2">{stat.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{stat.count} משתתפים</span>
                    <span className={`font-bold ${stat.percentage > 10 ? 'text-destructive' : ''}`}>
                      ({stat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {distributionStats.stats.length === 0 && (
              <p className="text-center text-muted-foreground py-4">אין נתונים להצגה</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            onClick={() => generateAllPDFs(participantProfiles, pdfSettings)}
            size="lg"
            className="gap-2"
          >
            <FileDown className="h-5 w-5" />
            הורד את כל המשתתפים ב-PDF אחד
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="gap-2">
                <Trash2 className="h-5 w-5" />
                אפס נתוני משתתפים
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו תמחק רק את נתוני המשתתפים והתוצאות שלהם.
                  <br />
                  <br />
                  מיפוי השאלות וספריית האישיויות יישארו שמורים.
                  <br />
                  <br />
                  לא ניתן לבטל פעולה זו!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAll}>
                  כן, מחק נתונים
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {participantProfiles.map((profile) => {
            const chartData = [
              { name: ELEMENT_NAMES.fire, value: profile.elementScores.fire },
              { name: ELEMENT_NAMES.water, value: profile.elementScores.water },
              { name: ELEMENT_NAMES.air, value: profile.elementScores.air },
              { name: ELEMENT_NAMES.earth, value: profile.elementScores.earth },
            ];

            return (
              <Card key={profile.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-mystical text-white">
                  <CardTitle className="text-right">
                    משתתף #{profile.id}
                    {profile.name && ` - ${profile.name}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                ELEMENT_COLORS[
                                  Object.keys(ELEMENT_NAMES)[index] as keyof typeof ELEMENT_COLORS
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {profile.matchedPersonality && (
                    <div className="space-y-2 text-right">
                      <h3 className="font-bold text-lg">
                        אישיות מספר {profile.matchedPersonality.number}
                        {profile.matchedPersonality.name && ` - ${profile.matchedPersonality.name}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.matchedPersonality.description}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => generatePDF(profile, pdfSettings)}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <Download className="h-4 w-4" />
                    הורד PDF
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;
