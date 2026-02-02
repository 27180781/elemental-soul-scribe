import { ParticipantProfile, PDFSettings } from "@/types/personality";
import { toast } from "sonner";
import jsPDF from "jspdf";

const ELEMENT_NAMES = {
  fire: "אש",
  water: "מים",
  air: "רוח",
  earth: "עפר",
};

// Black and white patterns for each element
const ELEMENT_PATTERNS = {
  fire: { fill: '#000000', pattern: 'solid' },
  water: { fill: '#666666', pattern: 'horizontal-lines' },
  air: { fill: '#999999', pattern: 'diagonal-lines' },
  earth: { fill: '#cccccc', pattern: 'dots' },
};

const createPattern = (ctx: CanvasRenderingContext2D, type: string, color: string): CanvasPattern | string => {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 10;
  patternCanvas.height = 10;
  const patternCtx = patternCanvas.getContext('2d')!;
  
  patternCtx.fillStyle = 'white';
  patternCtx.fillRect(0, 0, 10, 10);
  patternCtx.strokeStyle = color;
  patternCtx.fillStyle = color;
  patternCtx.lineWidth = 2;
  
  switch(type) {
    case 'solid':
      patternCtx.fillRect(0, 0, 10, 10);
      break;
    case 'horizontal-lines':
      patternCtx.beginPath();
      patternCtx.moveTo(0, 3);
      patternCtx.lineTo(10, 3);
      patternCtx.moveTo(0, 7);
      patternCtx.lineTo(10, 7);
      patternCtx.stroke();
      break;
    case 'diagonal-lines':
      patternCtx.beginPath();
      patternCtx.moveTo(0, 0);
      patternCtx.lineTo(10, 10);
      patternCtx.moveTo(-5, 5);
      patternCtx.lineTo(5, 15);
      patternCtx.moveTo(5, -5);
      patternCtx.lineTo(15, 5);
      patternCtx.stroke();
      break;
    case 'dots':
      patternCtx.beginPath();
      patternCtx.arc(5, 5, 2, 0, Math.PI * 2);
      patternCtx.fill();
      break;
  }
  
  return ctx.createPattern(patternCanvas, 'repeat') || color;
};

const create3DPieChart = (elementScores: any, width: number, height: number, percentageFontSize: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  const centerX = width / 2;
  const centerY = height / 2 - 20;
  const radius = Math.min(width, height) / 3;
  const depth = 30;
  
  const elements = [
    { name: 'fire', value: elementScores.fire, pattern: ELEMENT_PATTERNS.fire },
    { name: 'water', value: elementScores.water, pattern: ELEMENT_PATTERNS.water },
    { name: 'air', value: elementScores.air, pattern: ELEMENT_PATTERNS.air },
    { name: 'earth', value: elementScores.earth, pattern: ELEMENT_PATTERNS.earth },
  ];
  
  let startAngle = -Math.PI / 2;
  
  // Draw 3D depth layers (bottom to top)
  for (let d = depth; d >= 0; d -= 2) {
    let currentAngle = startAngle;
    
    elements.forEach((element) => {
      const sliceAngle = (element.value / 100) * 2 * Math.PI;
      
      if (element.value > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY + d, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY + d);
        ctx.closePath();
        
        // Darker shade for depth
        const depthShade = Math.floor(parseInt(element.pattern.fill.slice(1), 16) * 0.7);
        ctx.fillStyle = `#${depthShade.toString(16).padStart(6, '0')}`;
        ctx.fill();
        
        if (d === depth) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      currentAngle += sliceAngle;
    });
  }
  
  // Draw top surface with patterns
  let topAngle = startAngle;
  elements.forEach((element) => {
    const sliceAngle = (element.value / 100) * 2 * Math.PI;
    
    if (element.value > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, topAngle, topAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      ctx.fillStyle = createPattern(ctx, element.pattern.pattern, element.pattern.fill) as string | CanvasPattern;
      ctx.fill();
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add percentage label
      const labelAngle = topAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      // White background for text
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(labelX, labelY, percentageFontSize * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${percentageFontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${element.value.toFixed(0)}%`, labelX, labelY);
    }
    
    topAngle += sliceAngle;
  });
  
  return canvas.toDataURL('image/png');
};

// Create pattern SVG for legend boxes
const createPatternSVG = (type: string, fill: string): string => {
  const patterns: Record<string, string> = {
    'solid': `<rect width="100%" height="100%" fill="${fill}"/>`,
    'horizontal-lines': `<rect width="100%" height="100%" fill="white"/><line x1="0" y1="3" x2="10" y2="3" stroke="${fill}" stroke-width="2"/><line x1="0" y1="7" x2="10" y2="7" stroke="${fill}" stroke-width="2"/>`,
    'diagonal-lines': `<rect width="100%" height="100%" fill="white"/><line x1="0" y1="0" x2="10" y2="10" stroke="${fill}" stroke-width="2"/><line x1="-5" y1="5" x2="5" y2="15" stroke="${fill}" stroke-width="2"/><line x1="5" y1="-5" x2="15" y2="5" stroke="${fill}" stroke-width="2"/>`,
    'dots': `<rect width="100%" height="100%" fill="white"/><circle cx="5" cy="5" r="2" fill="${fill}"/>`,
  };
  
  const patternContent = patterns[type] || patterns['solid'];
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">${patternContent}</svg>`)}`;
};

const createProfileHTML = (profile: ParticipantProfile, settings: PDFSettings): HTMLElement => {
  const container = document.createElement('div');
  container.style.width = '210mm';
  container.style.height = '297mm';
  container.style.position = 'relative';
  container.style.backgroundColor = 'white';
  container.style.direction = 'rtl';
  container.style.fontFamily = 'Kanuba, Arial, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.overflow = 'hidden';

  const pieChartDataUrl = create3DPieChart(
    profile.elementScores, 
    settings.chartCanvasWidth, 
    settings.chartCanvasHeight,
    settings.chartPercentageFontSize
  );

  container.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; background: white;">
      <!-- Content Container with proper margins -->
      <div style="position: absolute; top: ${settings.contentTop}px; left: ${settings.contentLeft}px; right: ${settings.contentRight}px; bottom: ${settings.contentBottom}px; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: ${settings.headerMarginBottom}px;">
          <h1 style="color: #000000; font-size: ${settings.titleFontSize}px; margin: 0 0 10px 0; font-weight: 700; font-family: Kanuba, Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase;">
            משתתף מספר ${profile.id}
          </h1>
          ${profile.name ? `<h2 style="color: #333333; font-size: ${settings.nameFontSize}px; margin: 0; font-weight: 400; font-family: Kanuba, Arial, sans-serif;">${profile.name}</h2>` : ''}
        </div>

        <!-- 3D Pie Chart -->
        <div style="margin: ${settings.chartMarginTop}px 0 ${settings.chartMarginBottom}px 0;">
          <img src="${pieChartDataUrl}" style="width: ${settings.chartWidth}px; height: ${settings.chartHeight}px; display: block;" />
        </div>

        <!-- Legend with patterns -->
        <div style="display: flex; justify-content: center; gap: ${settings.legendGap}px; margin: ${settings.legendMarginTop}px 0; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: ${settings.legendBoxSize}px; height: ${settings.legendBoxSize}px; background: #000000; border: 2px solid #000000; border-radius: 2px;"></div>
            <span style="font-size: ${settings.legendFontSize}px; font-weight: 700; font-family: Kanuba, Arial, sans-serif; color: #000000;">${ELEMENT_NAMES.fire}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: ${settings.legendBoxSize}px; height: ${settings.legendBoxSize}px; background: url('${createPatternSVG('horizontal-lines', '#666666')}'); border: 2px solid #000000; border-radius: 2px;"></div>
            <span style="font-size: ${settings.legendFontSize}px; font-weight: 700; font-family: Kanuba, Arial, sans-serif; color: #000000;">${ELEMENT_NAMES.water}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: ${settings.legendBoxSize}px; height: ${settings.legendBoxSize}px; background: url('${createPatternSVG('diagonal-lines', '#999999')}'); border: 2px solid #000000; border-radius: 2px;"></div>
            <span style="font-size: ${settings.legendFontSize}px; font-weight: 700; font-family: Kanuba, Arial, sans-serif; color: #000000;">${ELEMENT_NAMES.air}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: ${settings.legendBoxSize}px; height: ${settings.legendBoxSize}px; background: url('${createPatternSVG('dots', '#cccccc')}'); border: 2px solid #000000; border-radius: 2px;"></div>
            <span style="font-size: ${settings.legendFontSize}px; font-weight: 700; font-family: Kanuba, Arial, sans-serif; color: #000000;">${ELEMENT_NAMES.earth}</span>
          </div>
        </div>

        ${profile.matchedPersonality ? `
          <div style="background: white; padding: ${settings.personalityPadding}px; border-radius: ${settings.personalityBorderRadius}px; margin-top: ${settings.personalityMarginTop}px; border: 3px solid #000000; box-shadow: 4px 4px 0px #000000; width: 100%; max-width: ${settings.personalityMaxWidth}px;">
            <div style="text-align: center; margin-bottom: 12px;">
              <span style="display: inline-block; background: #000000; color: white; padding: 8px 20px; border-radius: 0; font-size: ${settings.personalityTitleFontSize}px; font-weight: 700; font-family: Kanuba, Arial, sans-serif; letter-spacing: 1px;">
                ניתוח אישיות${profile.matchedPersonality.name ? ` - ${profile.matchedPersonality.name}` : ''}
              </span>
            </div>
            <div style="line-height: ${settings.personalityLineHeight}; font-size: ${settings.personalityTextFontSize}px; color: #000000; text-align: center; font-weight: 400; font-family: Kanuba, Arial, sans-serif;">
              ${profile.matchedPersonality.description}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  return container;
};

export const generatePDF = async (profile: ParticipantProfile, settings: PDFSettings) => {
  try {
    toast.loading("מייצר PDF...");
    
    const element = createProfileHTML(profile, settings);
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

export const generateAllPDFs = async (profiles: ParticipantProfile[], settings: PDFSettings, batchSize: number = 10) => {
  if (!profiles.length) {
    toast.error("אין משתתפים להורדה");
    return;
  }

  const totalBatches = Math.ceil(profiles.length / batchSize);
  
  try {
    const html2canvas = (await import('html2canvas')).default;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, profiles.length);
      const batchProfiles = profiles.slice(startIndex, endIndex);
      
      toast.loading(`מייצר קובץ ${batchIndex + 1} מתוך ${totalBatches} (משתתפים ${startIndex + 1}-${endIndex})...`);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < batchProfiles.length; i++) {
        const profile = batchProfiles[i];
        const element = createProfileHTML(profile, settings);
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

      pdf.save(`personality-profiles-${startIndex + 1}-${endIndex}.pdf`);
      toast.dismiss();
      
      // Small delay between batches to prevent browser freeze
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    toast.success(`${totalBatches} קבצי PDF הורדו בהצלחה (${profiles.length} משתתפים)`);
  } catch (error) {
    console.error('Error generating all PDFs:', error);
    toast.dismiss();
    toast.error("שגיאה ביצירת PDF");
  }
};
