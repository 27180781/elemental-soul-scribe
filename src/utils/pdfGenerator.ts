import { ParticipantProfile } from "@/types/personality";
import { toast } from "sonner";
import jsPDF from "jspdf";

const ELEMENT_NAMES = {
  fire: "אש",
  water: "מים",
  air: "רוח",
  earth: "עפר",
};

const createProfileHTML = (profile: ParticipantProfile): HTMLElement => {
  const container = document.createElement('div');
  container.style.width = '210mm';
  container.style.minHeight = '297mm';
  container.style.padding = '20mm';
  container.style.backgroundColor = 'white';
  container.style.direction = 'rtl';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <div style="text-align: right;">
      <h1 style="color: #5b21b6; border-bottom: 3px solid #5b21b6; padding-bottom: 10px; margin-bottom: 20px; font-size: 28px;">
        פרופיל אישיות - משתתף #${profile.id}
      </h1>
      ${profile.name ? `<h2 style="font-size: 20px; color: #666; margin-bottom: 30px;">שם: ${profile.name}</h2>` : ''}
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0;">
        <div style="border: 2px solid #f97316; background: #fff7ed; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">🔥 ${ELEMENT_NAMES.fire}</div>
          <div style="font-size: 32px; font-weight: bold; color: #f97316;">${profile.elementScores.fire.toFixed(1)}%</div>
        </div>
        <div style="border: 2px solid #0ea5e9; background: #f0f9ff; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">💧 ${ELEMENT_NAMES.water}</div>
          <div style="font-size: 32px; font-weight: bold; color: #0ea5e9;">${profile.elementScores.water.toFixed(1)}%</div>
        </div>
        <div style="border: 2px solid #22d3ee; background: #ecfeff; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">💨 ${ELEMENT_NAMES.air}</div>
          <div style="font-size: 32px; font-weight: bold; color: #22d3ee;">${profile.elementScores.air.toFixed(1)}%</div>
        </div>
        <div style="border: 2px solid #84cc16; background: #f7fee7; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">🌍 ${ELEMENT_NAMES.earth}</div>
          <div style="font-size: 32px; font-weight: bold; color: #84cc16;">${profile.elementScores.earth.toFixed(1)}%</div>
        </div>
      </div>

      ${profile.matchedPersonality ? `
        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-top: 30px;">
          <div style="font-size: 24px; color: #5b21b6; margin-bottom: 15px; font-weight: bold;">
            אישיות מספר ${profile.matchedPersonality.number}
          </div>
          <div style="line-height: 1.8; font-size: 16px; color: #333;">
            ${profile.matchedPersonality.description}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  return container;
};

export const generatePDF = async (profile: ParticipantProfile) => {
  try {
    toast.loading("מייצר PDF...");
    
    const element = createProfileHTML(profile);
    document.body.appendChild(element);

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 794, // A4 width in pixels at 96 DPI
      windowHeight: 1123, // A4 height in pixels at 96 DPI
    });

    document.body.removeChild(element);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`personality-profile-${profile.id}.pdf`);
    
    toast.dismiss();
    toast.success("PDF הורד בהצלחה");
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error("שגיאה ביצירת PDF");
  }
};

export const generateAllPDFs = async (profiles: ParticipantProfile[]) => {
  if (!profiles.length) {
    toast.error("אין משתתפים להורדה");
    return;
  }

  try {
    toast.loading(`מייצר PDF עם ${profiles.length} משתתפים...`);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const html2canvas = (await import('html2canvas')).default;

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const element = createProfileHTML(profile);
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123,
      });

      document.body.removeChild(element);

      if (i > 0) {
        pdf.addPage();
      }

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    }

    pdf.save(`all-personality-profiles.pdf`);
    
    toast.dismiss();
    toast.success(`PDF עם ${profiles.length} משתתפים הורד בהצלחה`);
  } catch (error) {
    console.error('Error generating all PDFs:', error);
    toast.dismiss();
    toast.error("שגיאה ביצירת PDF");
  }
};
