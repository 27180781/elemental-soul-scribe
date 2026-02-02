import { useEffect, useRef, useState } from "react";
import { PDFSettings, ParticipantProfile } from "@/types/personality";

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

const SAMPLE_PROFILE: ParticipantProfile = {
  id: 1,
  name: "דוגמה",
  elementScores: {
    fire: 30,
    water: 25,
    air: 25,
    earth: 20,
  },
  matchedPersonality: {
    id: "1",
    number: 1,
    name: "המנהיג",
    description: "זוהי דוגמה לתיאור אישיות. טקסט זה מציג איך ייראה הניתוח האישי במסמך הסופי עם כל ההגדרות שלך.",
    percentages: {
      fire: 30,
      water: 25,
      air: 25,
      earth: 20,
    },
  },
  matchScore: 0,
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

interface PDFPreviewProps {
  settings: PDFSettings;
}

const PDFPreview = ({ settings }: PDFPreviewProps) => {
  const [chartDataUrl, setChartDataUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dataUrl = create3DPieChart(
      SAMPLE_PROFILE.elementScores,
      settings.chartCanvasWidth,
      settings.chartCanvasHeight,
      settings.chartPercentageFontSize
    );
    setChartDataUrl(dataUrl);
  }, [settings]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-auto" style={{ direction: 'rtl' }}>
      <div 
        ref={containerRef}
        className="relative mx-auto bg-white"
        style={{
          width: '210mm',
          height: '297mm',
          transform: 'scale(0.5)',
          transformOrigin: 'top center',
          marginBottom: '-148.5mm'
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', background: 'white' }}>
          <div style={{
            position: 'absolute',
            top: `${settings.contentTop}px`,
            left: `${settings.contentLeft}px`,
            right: `${settings.contentRight}px`,
            bottom: `${settings.contentBottom}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: `${settings.headerMarginBottom}px` 
            }}>
              <h1 style={{
                color: '#000000',
                fontSize: `${settings.titleFontSize}px`,
                margin: '0 0 10px 0',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                משתתף מספר {SAMPLE_PROFILE.id}
              </h1>
              {SAMPLE_PROFILE.name && (
                <h2 style={{
                  color: '#333333',
                  fontSize: `${settings.nameFontSize}px`,
                  margin: 0,
                  fontStyle: 'italic',
                }}>
                  {SAMPLE_PROFILE.name}
                </h2>
              )}
            </div>

            <div style={{ 
              margin: `${settings.chartMarginTop}px 0 ${settings.chartMarginBottom}px 0` 
            }}>
              {chartDataUrl && (
                <img 
                  src={chartDataUrl} 
                  style={{ 
                    width: `${settings.chartWidth}px`, 
                    height: `${settings.chartHeight}px`, 
                    display: 'block' 
                  }} 
                  alt="Chart"
                />
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: `${settings.legendGap}px`,
              margin: `${settings.legendMarginTop}px 0`,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: `${settings.legendBoxSize}px`,
                  height: `${settings.legendBoxSize}px`,
                  background: '#000000',
                  border: '2px solid #000000',
                  borderRadius: '2px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#000000',
                }}>{ELEMENT_NAMES.fire}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: `${settings.legendBoxSize}px`,
                  height: `${settings.legendBoxSize}px`,
                  background: `url('${createPatternSVG('horizontal-lines', '#666666')}')`,
                  border: '2px solid #000000',
                  borderRadius: '2px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#000000',
                }}>{ELEMENT_NAMES.water}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: `${settings.legendBoxSize}px`,
                  height: `${settings.legendBoxSize}px`,
                  background: `url('${createPatternSVG('diagonal-lines', '#999999')}')`,
                  border: '2px solid #000000',
                  borderRadius: '2px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#000000',
                }}>{ELEMENT_NAMES.air}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: `${settings.legendBoxSize}px`,
                  height: `${settings.legendBoxSize}px`,
                  background: `url('${createPatternSVG('dots', '#cccccc')}')`,
                  border: '2px solid #000000',
                  borderRadius: '2px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#000000',
                }}>{ELEMENT_NAMES.earth}</span>
              </div>
            </div>

            {SAMPLE_PROFILE.matchedPersonality && (
              <div style={{
                background: 'white',
                padding: `${settings.personalityPadding}px`,
                borderRadius: `${settings.personalityBorderRadius}px`,
                marginTop: `${settings.personalityMarginTop}px`,
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px #000000',
                width: '100%',
                maxWidth: `${settings.personalityMaxWidth}px`,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#000000',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '0',
                    fontSize: `${settings.personalityTitleFontSize}px`,
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                  }}>
                    ניתוח אישיות{SAMPLE_PROFILE.matchedPersonality.name ? ` - ${SAMPLE_PROFILE.matchedPersonality.name}` : ''}
                  </span>
                </div>
                <div style={{
                  lineHeight: settings.personalityLineHeight,
                  fontSize: `${settings.personalityTextFontSize}px`,
                  color: '#000000',
                  textAlign: 'center',
                }}>
                  {SAMPLE_PROFILE.matchedPersonality.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;