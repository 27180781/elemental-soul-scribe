import { ParticipantProfile } from "@/types/personality";
import { toast } from "sonner";

const ELEMENT_NAMES = {
  fire: "אש",
  water: "מים",
  air: "רוח",
  earth: "עפר",
};

export const generatePDF = (profile: ParticipantProfile) => {
  // Create a simple HTML document for the PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>פרופיל אישיות - משתתף ${profile.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          direction: rtl;
        }
        h1 {
          color: #5b21b6;
          border-bottom: 3px solid #5b21b6;
          padding-bottom: 10px;
        }
        .element-scores {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 30px 0;
        }
        .element-box {
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .element-box.fire { border-color: #f97316; background: #fff7ed; }
        .element-box.water { border-color: #0ea5e9; background: #f0f9ff; }
        .element-box.air { border-color: #22d3ee; background: #ecfeff; }
        .element-box.earth { border-color: #84cc16; background: #f7fee7; }
        .element-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .element-percentage {
          font-size: 36px;
          font-weight: bold;
        }
        .personality-section {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          margin-top: 30px;
        }
        .personality-title {
          font-size: 28px;
          color: #5b21b6;
          margin-bottom: 15px;
        }
        .personality-description {
          line-height: 1.8;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <h1>פרופיל אישיות - משתתף #${profile.id}</h1>
      ${profile.name ? `<h2>שם: ${profile.name}</h2>` : ''}
      
      <div class="element-scores">
        <div class="element-box fire">
          <div class="element-name">🔥 ${ELEMENT_NAMES.fire}</div>
          <div class="element-percentage">${profile.elementScores.fire.toFixed(1)}%</div>
        </div>
        <div class="element-box water">
          <div class="element-name">💧 ${ELEMENT_NAMES.water}</div>
          <div class="element-percentage">${profile.elementScores.water.toFixed(1)}%</div>
        </div>
        <div class="element-box air">
          <div class="element-name">💨 ${ELEMENT_NAMES.air}</div>
          <div class="element-percentage">${profile.elementScores.air.toFixed(1)}%</div>
        </div>
        <div class="element-box earth">
          <div class="element-name">🌍 ${ELEMENT_NAMES.earth}</div>
          <div class="element-percentage">${profile.elementScores.earth.toFixed(1)}%</div>
        </div>
      </div>

      ${profile.matchedPersonality ? `
        <div class="personality-section">
          <div class="personality-title">אישיות מספר ${profile.matchedPersonality.number}</div>
          <div class="personality-description">${profile.matchedPersonality.description}</div>
        </div>
      ` : ''}
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `personality-profile-${profile.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("קובץ הורד בהצלחה - ניתן להמיר ל-PDF בדפדפן");
};
