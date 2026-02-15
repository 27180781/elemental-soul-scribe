import { ParticipantProfile, PDFSettings } from "@/types/personality";
import { toast } from "sonner";
import jsPDF from "jspdf";

const ELEMENT_NAMES = {
  fire: "אש",
  water: "מים",
  air: "רוח",
  earth: "עפר",
};

const ELEMENT_PATTERNS = {
  fire: { fill: '#000000', pattern: 'solid' as const },
  water: { fill: '#666666', pattern: 'horizontal-lines' as const },
  air: { fill: '#999999', pattern: 'diagonal-lines' as const },
  earth: { fill: '#cccccc', pattern: 'dots' as const },
};

// Reverse Hebrew string for jsPDF RTL support
const reverseHebrew = (text: string): string => {
  // Split into segments of Hebrew and non-Hebrew
  const segments = text.match(/[\u0590-\u05FF\s]+|[^\u0590-\u05FF\s]+/g) || [text];
  
  // Reverse Hebrew segments, keep numbers/latin as-is
  const processed = segments.map(seg => {
    if (/[\u0590-\u05FF]/.test(seg)) {
      return seg.split('').reverse().join('');
    }
    return seg;
  });
  
  return processed.reverse().join('');
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

// Create pie chart on a smaller canvas, return as JPEG data URL
const create3DPieChart = (elementScores: any, width: number, height: number, percentageFontSize: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  const centerX = width / 2;
  const centerY = height / 2 - 10;
  const radius = Math.min(width, height) / 3.5;
  const depth = 20; // reduced from 30

  const elements = [
    { name: 'fire', value: elementScores.fire, pattern: ELEMENT_PATTERNS.fire },
    { name: 'water', value: elementScores.water, pattern: ELEMENT_PATTERNS.water },
    { name: 'air', value: elementScores.air, pattern: ELEMENT_PATTERNS.air },
    { name: 'earth', value: elementScores.earth, pattern: ELEMENT_PATTERNS.earth },
  ];
  
  let startAngle = -Math.PI / 2;
  
  // Draw 3D depth layers
  for (let d = depth; d >= 0; d -= 3) { // step 3 instead of 2
    let currentAngle = startAngle;
    elements.forEach((element) => {
      const sliceAngle = (element.value / 100) * 2 * Math.PI;
      if (element.value > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY + d, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY + d);
        ctx.closePath();
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
  
  // Label positions
  const labelPositions: Array<{ element: typeof elements[0]; midAngle: number }> = [];
  
  // Top surface with patterns
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
      labelPositions.push({ element, midAngle: topAngle + sliceAngle / 2 });
    }
    topAngle += sliceAngle;
  });
  
  // External labels with leader lines
  const outerLabelRadius = radius + 40;
  const lineStartRadius = radius + 8;
  const lineBendRadius = radius + 25;
  
  labelPositions.forEach(({ element, midAngle }) => {
    const lineStartX = centerX + Math.cos(midAngle) * lineStartRadius;
    const lineStartY = centerY + Math.sin(midAngle) * lineStartRadius;
    const lineBendX = centerX + Math.cos(midAngle) * lineBendRadius;
    const lineBendY = centerY + Math.sin(midAngle) * lineBendRadius;
    const labelX = centerX + Math.cos(midAngle) * outerLabelRadius;
    const isRightSide = Math.cos(midAngle) > 0;
    const horizontalOffset = isRightSide ? 20 : -20;
    const finalLabelX = labelX + horizontalOffset;
    
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(lineBendX, lineBendY);
    ctx.lineTo(finalLabelX, lineBendY);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    const labelText = `${element.value.toFixed(0)}%`;
    ctx.font = `bold ${percentageFontSize}px Arial`;
    const textWidth = ctx.measureText(labelText).width;
    const padding = 6;
    const bgX = isRightSide ? finalLabelX : finalLabelX - textWidth - padding * 2;
    const bgY = lineBendY - percentageFontSize / 2 - padding;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = percentageFontSize + padding * 2;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);
    
    ctx.fillStyle = '#000000';
    ctx.textAlign = isRightSide ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, isRightSide ? finalLabelX + padding : finalLabelX - padding, lineBendY);
  });
  
  // Return as JPEG for speed
  return canvas.toDataURL('image/jpeg', 0.85);
};

// Draw a pattern-filled rectangle directly on a small canvas and return as data URL
const createLegendPatternImage = (type: string, fill: string, size: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = createPattern(ctx, type, fill) as string | CanvasPattern;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.9);
};

// Convert px-based settings to mm for jsPDF (assuming 96 DPI screen reference)
const pxToMm = (px: number): number => px * 0.264583;

// Render a single profile directly onto jsPDF page
const renderProfileToPDF = (pdf: jsPDF, profile: ParticipantProfile, settings: PDFSettings) => {
  const pageWidth = 210; // A4 mm
  const contentLeftMm = pxToMm(settings.contentLeft);
  const contentRightMm = pxToMm(settings.contentRight);
  const contentTopMm = pxToMm(settings.contentTop);
  const usableWidth = pageWidth - contentLeftMm - contentRightMm;
  const centerX = pageWidth / 2;
  
  let y = contentTopMm;
  
  // --- Title: "משתתף מספר X" ---
  const titleFontSize = Math.max(12, pxToMm(settings.titleFontSize) * 1.8);
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(titleFontSize);
  pdf.setTextColor(0, 0, 0);
  const titleText = reverseHebrew(`משתתף מספר ${profile.id}`);
  pdf.text(titleText, centerX, y, { align: 'center' });
  y += titleFontSize * 0.5 + 3;
  
  // --- Name ---
  if (profile.name) {
    const nameFontSize = Math.max(10, pxToMm(settings.nameFontSize) * 1.8);
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(nameFontSize);
    pdf.setTextColor(51, 51, 51);
    const nameText = reverseHebrew(profile.name);
    pdf.text(nameText, centerX, y, { align: 'center' });
    y += nameFontSize * 0.5 + 2;
  }
  
  y += pxToMm(settings.headerMarginBottom);
  
  // --- Pie Chart ---
  y += pxToMm(settings.chartMarginTop);
  const chartWidthMm = pxToMm(settings.chartWidth);
  const chartHeightMm = pxToMm(settings.chartHeight);
  
  // Use smaller canvas for speed
  const canvasW = Math.min(settings.chartCanvasWidth, 400);
  const canvasH = Math.min(settings.chartCanvasHeight, 300);
  const pieDataUrl = create3DPieChart(profile.elementScores, canvasW, canvasH, settings.chartPercentageFontSize);
  
  const chartX = centerX - chartWidthMm / 2;
  pdf.addImage(pieDataUrl, 'JPEG', chartX, y, chartWidthMm, chartHeightMm);
  y += chartHeightMm;
  y += pxToMm(settings.chartMarginBottom);
  
  // --- Legend ---
  y += pxToMm(settings.legendMarginTop);
  const legendFontSize = Math.max(8, pxToMm(settings.legendFontSize) * 1.8);
  const boxSizeMm = pxToMm(settings.legendBoxSize);
  const gapMm = pxToMm(settings.legendGap);
  
  // Pre-create legend pattern images
  const elementKeys: Array<'fire' | 'water' | 'air' | 'earth'> = ['fire', 'water', 'air', 'earth'];
  const legendItems = elementKeys.map(key => ({
    name: ELEMENT_NAMES[key],
    patternImg: createLegendPatternImage(ELEMENT_PATTERNS[key].pattern, ELEMENT_PATTERNS[key].fill, 40),
  }));
  
  // Calculate total legend width for centering
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(legendFontSize);
  const itemWidths = legendItems.map(item => {
    const textW = pdf.getTextWidth(reverseHebrew(item.name));
    return boxSizeMm + 2 + textW;
  });
  const totalLegendWidth = itemWidths.reduce((a, b) => a + b, 0) + (legendItems.length - 1) * gapMm;
  let legendX = centerX + totalLegendWidth / 2; // start from right for RTL
  
  legendItems.forEach((item, i) => {
    const textW = pdf.getTextWidth(reverseHebrew(item.name));
    
    // Text first (right side in RTL)
    pdf.setTextColor(0, 0, 0);
    pdf.text(reverseHebrew(item.name), legendX, y + boxSizeMm * 0.7, { align: 'right' });
    legendX -= textW + 2;
    
    // Pattern box
    pdf.addImage(item.patternImg, 'JPEG', legendX - boxSizeMm, y, boxSizeMm, boxSizeMm);
    legendX -= boxSizeMm + gapMm;
  });
  
  y += boxSizeMm + 4;
  
  // --- Personality Box ---
  if (profile.matchedPersonality) {
    y += pxToMm(settings.personalityMarginTop);
    const boxPaddingMm = pxToMm(settings.personalityPadding);
    const maxWidthMm = Math.min(pxToMm(settings.personalityMaxWidth), usableWidth);
    const boxX = centerX - maxWidthMm / 2;
    
    // Title badge
    const personalityTitleFontSize = Math.max(8, pxToMm(settings.personalityTitleFontSize) * 1.8);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(personalityTitleFontSize);
    
    const badgeText = reverseHebrew(
      profile.matchedPersonality.name 
        ? `ניתוח אישיות - ${profile.matchedPersonality.name}` 
        : 'ניתוח אישיות'
    );
    const badgeTextWidth = pdf.getTextWidth(badgeText);
    const badgePadH = 6;
    const badgePadV = 3;
    const badgeWidth = badgeTextWidth + badgePadH * 2;
    const badgeHeight = personalityTitleFontSize * 0.5 + badgePadV * 2;
    const badgeX = centerX - badgeWidth / 2;
    
    // Description text
    const descFontSize = Math.max(7, pxToMm(settings.personalityTextFontSize) * 1.8);
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(descFontSize);
    
    const descText = reverseHebrew(profile.matchedPersonality.description);
    const descMaxWidth = maxWidthMm - boxPaddingMm * 2;
    const descLines = pdf.splitTextToSize(descText, descMaxWidth) as string[];
    const lineHeightMm = descFontSize * 0.5 * (settings.personalityLineHeight || 1.7);
    const descTotalHeight = descLines.length * lineHeightMm;
    
    const boxHeight = badgeHeight + 4 + descTotalHeight + boxPaddingMm * 2;
    
    // Box border + shadow
    pdf.setFillColor(0, 0, 0);
    pdf.rect(boxX + 1.5, y + 1.5, maxWidthMm, boxHeight, 'F'); // shadow
    pdf.setFillColor(255, 255, 255);
    pdf.rect(boxX, y, maxWidthMm, boxHeight, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.8);
    pdf.rect(boxX, y, maxWidthMm, boxHeight, 'S');
    
    // Badge
    const badgeY = y + boxPaddingMm;
    pdf.setFillColor(0, 0, 0);
    pdf.rect(badgeX, badgeY, badgeWidth, badgeHeight, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(personalityTitleFontSize);
    pdf.text(badgeText, centerX, badgeY + badgeHeight / 2 + personalityTitleFontSize * 0.15, { align: 'center' });
    
    // Description
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(descFontSize);
    let descY = badgeY + badgeHeight + 4;
    descLines.forEach((line: string) => {
      pdf.text(line, centerX, descY, { align: 'center' });
      descY += lineHeightMm;
    });
  }
};

export const generatePDF = async (profile: ParticipantProfile, settings: PDFSettings) => {
  try {
    toast.loading("מייצר PDF...");
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    renderProfileToPDF(pdf, profile, settings);
    pdf.save(`personality-profile-${profile.id}.pdf`);
    
    toast.dismiss();
    toast.success("PDF הורד בהצלחה");
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error("שגיאה ביצירת PDF");
  }
};

// Parallel processing helper
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
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await processor(items[index], index);
      completed++;
      onProgress?.(completed, items.length);
    }
  };

  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
};

export const generateAllPDFs = async (
  profiles: ParticipantProfile[], 
  settings: PDFSettings, 
  batchSize: number = 10,
  parallelWorkers: number = 3,
  onProgress?: (current: number, total: number, stage: string) => void
) => {
  if (!profiles.length) {
    toast.error("אין משתתפים להורדה");
    return;
  }

  const totalBatches = Math.ceil(profiles.length / batchSize);
  let overallProcessed = 0;
  
  try {
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, profiles.length);
      const batchProfiles = profiles.slice(startIndex, endIndex);
      
      onProgress?.(overallProcessed, profiles.length, `מכין קובץ ${batchIndex + 1} מתוך ${totalBatches}...`);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Draw each profile directly on PDF pages
      batchProfiles.forEach((profile, index) => {
        if (index > 0) {
          pdf.addPage();
        }
        renderProfileToPDF(pdf, profile, settings);
        overallProcessed++;
        onProgress?.(overallProcessed, profiles.length, `מעבד משתתף ${overallProcessed} מתוך ${profiles.length}`);
      });

      pdf.save(`personality-profiles-${startIndex + 1}-${endIndex}.pdf`);
      
      // Small delay between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    toast.success(`${totalBatches} קבצי PDF הורדו בהצלחה (${profiles.length} משתתפים)`);
  } catch (error) {
    console.error('Error generating all PDFs:', error);
    toast.error("שגיאה ביצירת PDF");
  }
};
