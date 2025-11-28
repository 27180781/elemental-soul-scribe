import { ParticipantProfile } from "@/types/personality";
import { toast } from "sonner";
import jsPDF from "jspdf";
import pdfTemplate from "@/assets/pdf-template.png";

const ELEMENT_NAMES = {
  fire: "אש",
  water: "מים",
  air: "רוח",
  earth: "עפר",
};

const ELEMENT_COLORS = {
  fire: { primary: '#f97316', secondary: '#fb923c', shadow: '#ea580c' },
  water: { primary: '#0ea5e9', secondary: '#38bdf8', shadow: '#0284c7' },
  air: { primary: '#22d3ee', secondary: '#67e8f9', shadow: '#06b6d4' },
  earth: { primary: '#84cc16', secondary: '#a3e635', shadow: '#65a30d' },
};

const create3DPieChart = (elementScores: any, width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const centerX = width / 2;
  const centerY = height / 2 - 20;
  const radius = Math.min(width, height) / 3;
  const depth = 30;
  
  const elements = [
    { name: 'fire', value: elementScores.fire, colors: ELEMENT_COLORS.fire },
    { name: 'water', value: elementScores.water, colors: ELEMENT_COLORS.water },
    { name: 'air', value: elementScores.air, colors: ELEMENT_COLORS.air },
    { name: 'earth', value: elementScores.earth, colors: ELEMENT_COLORS.earth },
  ];
  
  let startAngle = -Math.PI / 2;
  
  // Draw 3D depth layers (bottom to top)
  for (let d = depth; d >= 0; d -= 2) {
    let currentAngle = startAngle;
    
    elements.forEach((element) => {
      const sliceAngle = (element.value / 100) * 2 * Math.PI;
      
      if (element.value > 0) {
        // Draw side of slice
        ctx.beginPath();
        ctx.arc(centerX, centerY + d, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY + d);
        ctx.closePath();
        
        // Gradient for 3D effect
        const gradient = ctx.createRadialGradient(
          centerX, centerY + d, 0,
          centerX, centerY + d, radius
        );
        gradient.addColorStop(0, element.colors.secondary);
        gradient.addColorStop(0.7, element.colors.primary);
        gradient.addColorStop(1, element.colors.shadow);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add shadow/edge
        if (d === depth) {
          ctx.strokeStyle = element.colors.shadow;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      currentAngle += sliceAngle;
    });
  }
  
  // Draw top surface with highlights
  let topAngle = startAngle;
  elements.forEach((element) => {
    const sliceAngle = (element.value / 100) * 2 * Math.PI;
    
    if (element.value > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, topAngle, topAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      // Top gradient
      const topGradient = ctx.createRadialGradient(
        centerX - radius/3, centerY - radius/3, 0,
        centerX, centerY, radius
      );
      topGradient.addColorStop(0, element.colors.secondary);
      topGradient.addColorStop(0.6, element.colors.primary);
      topGradient.addColorStop(1, element.colors.shadow);
      
      ctx.fillStyle = topGradient;
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add percentage label
      const labelAngle = topAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = element.colors.shadow;
      ctx.lineWidth = 3;
      ctx.strokeText(`${element.value.toFixed(0)}%`, labelX, labelY);
      ctx.fillText(`${element.value.toFixed(0)}%`, labelX, labelY);
    }
    
    topAngle += sliceAngle;
  });
  
  return canvas.toDataURL('image/png');
};

const createProfileHTML = (profile: ParticipantProfile): HTMLElement => {
  const container = document.createElement('div');
  container.style.width = '210mm';
  container.style.height = '297mm';
  container.style.position = 'relative';
  container.style.backgroundColor = 'white';
  container.style.direction = 'rtl';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.overflow = 'hidden';

  const pieChartDataUrl = create3DPieChart(profile.elementScores, 600, 400);

  container.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%;">
      <!-- Background Template -->
      <img src="${pdfTemplate}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" />
      
      <!-- Content Container with proper margins -->
      <div style="position: absolute; top: 180px; left: 60px; right: 60px; bottom: 120px; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e293b; font-size: 36px; margin: 0 0 10px 0; font-weight: bold;">
            משתתף מספר ${profile.id}
          </h1>
          ${profile.name ? `<h2 style="color: #475569; font-size: 24px; margin: 0;">${profile.name}</h2>` : ''}
        </div>

        <!-- 3D Pie Chart -->
        <div style="margin: 20px 0;">
          <img src="${pieChartDataUrl}" style="width: 400px; height: auto; display: block;" />
        </div>

        <!-- Legend -->
        <div style="display: flex; justify-content: center; gap: 20px; margin: 15px 0; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: ${ELEMENT_COLORS.fire.primary}; border-radius: 4px;"></div>
            <span style="font-size: 16px; font-weight: bold; color: #1e293b;">🔥 ${ELEMENT_NAMES.fire}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: ${ELEMENT_COLORS.water.primary}; border-radius: 4px;"></div>
            <span style="font-size: 16px; font-weight: bold; color: #1e293b;">💧 ${ELEMENT_NAMES.water}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: ${ELEMENT_COLORS.air.primary}; border-radius: 4px;"></div>
            <span style="font-size: 16px; font-weight: bold; color: #1e293b;">💨 ${ELEMENT_NAMES.air}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background: ${ELEMENT_COLORS.earth.primary}; border-radius: 4px;"></div>
            <span style="font-size: 16px; font-weight: bold; color: #1e293b;">🌍 ${ELEMENT_NAMES.earth}</span>
          </div>
        </div>

        ${profile.matchedPersonality ? `
          <div style="background: rgba(255, 255, 255, 0.95); padding: 20px 25px; border-radius: 16px; margin-top: 20px; border: 2px solid #5b21b6; box-shadow: 0 4px 12px rgba(91, 33, 182, 0.2); width: 100%; max-width: 600px;">
            <div style="text-align: center; margin-bottom: 12px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 22px; font-weight: bold;">
                ניתוח אישיות${profile.matchedPersonality.name ? ` - ${profile.matchedPersonality.name}` : ''}
              </span>
            </div>
            <div style="line-height: 1.7; font-size: 16px; color: #1e293b; text-align: center;">
              ${profile.matchedPersonality.description}
            </div>
          </div>
        ` : ''}
      </div>
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
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
    });

    document.body.removeChild(element);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const imgHeight = 297;
    
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
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });

      document.body.removeChild(element);

      if (i > 0) {
        pdf.addPage();
      }

      const imgWidth = 210;
      const imgHeight = 297;
      
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
