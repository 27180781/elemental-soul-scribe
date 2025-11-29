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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, Sparkles, FileDown, Trash2, Home } from "lucide-react";
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
  const { participantProfiles, resetParticipantData, pdfSettings } = useData();
  const navigate = useNavigate();

  const handleResetAll = () => {
    resetParticipantData();
    toast.success("נתוני המשתתפים נמחקו בהצלחה");
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
