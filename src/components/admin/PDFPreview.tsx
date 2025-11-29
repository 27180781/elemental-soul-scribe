import { useEffect, useRef, useState } from "react";
import { PDFSettings, ParticipantProfile } from "@/types/personality";
import pdfTemplate from "@/assets/pdf-template.png";

const ELEMENT_NAMES = {
  fire: "אש",
  water: "מים",
  air: "רוח",
  earth: "עפר",
};

const ELEMENT_COLORS = {
  fire: { primary: '#dc2626', secondary: '#ef4444', shadow: '#b91c1c' },
  water: { primary: '#2563eb', secondary: '#3b82f6', shadow: '#1d4ed8' },
  air: { primary: '#16a34a', secondary: '#22c55e', shadow: '#15803d' },
  earth: { primary: '#92400e', secondary: '#b45309', shadow: '#78350f' },
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

const create3DPieChart = (elementScores: any, width: number, height: number, percentageFontSize: number): string => {
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
  
  for (let d = depth; d >= 0; d -= 2) {
    let currentAngle = startAngle;
    
    elements.forEach((element) => {
      const sliceAngle = (element.value / 100) * 2 * Math.PI;
      
      if (element.value > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY + d, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY + d);
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY + d, 0,
          centerX, centerY + d, radius
        );
        gradient.addColorStop(0, element.colors.secondary);
        gradient.addColorStop(0.7, element.colors.primary);
        gradient.addColorStop(1, element.colors.shadow);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        if (d === depth) {
          ctx.strokeStyle = element.colors.shadow;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      currentAngle += sliceAngle;
    });
  }
  
  let topAngle = startAngle;
  elements.forEach((element) => {
    const sliceAngle = (element.value / 100) * 2 * Math.PI;
    
    if (element.value > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, topAngle, topAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
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
      
      const labelAngle = topAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      ctx.fillStyle = 'white';
      ctx.font = `bold ${percentageFontSize}px Arial`;
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
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img 
            src={pdfTemplate} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
            alt="PDF Template"
          />
          
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
                color: '#1e293b',
                fontSize: `${settings.titleFontSize}px`,
                margin: '0 0 10px 0',
                fontWeight: 'bold',
              }}>
                משתתף מספר {SAMPLE_PROFILE.id}
              </h1>
              {SAMPLE_PROFILE.name && (
                <h2 style={{
                  color: '#475569',
                  fontSize: `${settings.nameFontSize}px`,
                  margin: 0,
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
                  background: ELEMENT_COLORS.fire.primary,
                  borderRadius: '4px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#1e293b',
                }}>🔥 {ELEMENT_NAMES.fire}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: `${settings.legendBoxSize}px`,
                  height: `${settings.legendBoxSize}px`,
                  background: ELEMENT_COLORS.water.primary,
                  borderRadius: '4px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#1e293b',
                }}>💧 {ELEMENT_NAMES.water}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: `${settings.legendBoxSize}px`,
                  height: `${settings.legendBoxSize}px`,
                  background: ELEMENT_COLORS.air.primary,
                  borderRadius: '4px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#1e293b',
                }}>💨 {ELEMENT_NAMES.air}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: `${settings.legendBoxSize}px`,
                  height: `${settings.legendBoxSize}px`,
                  background: ELEMENT_COLORS.earth.primary,
                  borderRadius: '4px',
                }}></div>
                <span style={{
                  fontSize: `${settings.legendFontSize}px`,
                  fontWeight: 'bold',
                  color: '#1e293b',
                }}>🌍 {ELEMENT_NAMES.earth}</span>
              </div>
            </div>

            {SAMPLE_PROFILE.matchedPersonality && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: `${settings.personalityPadding}px`,
                borderRadius: `${settings.personalityBorderRadius}px`,
                marginTop: `${settings.personalityMarginTop}px`,
                border: '2px solid #5b21b6',
                boxShadow: '0 4px 12px rgba(91, 33, 182, 0.2)',
                width: '100%',
                maxWidth: `${settings.personalityMaxWidth}px`,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: `${settings.personalityTitleFontSize}px`,
                    fontWeight: 'bold',
                  }}>
                    ניתוח אישיות{SAMPLE_PROFILE.matchedPersonality.name ? ` - ${SAMPLE_PROFILE.matchedPersonality.name}` : ''}
                  </span>
                </div>
                <div style={{
                  lineHeight: settings.personalityLineHeight,
                  fontSize: `${settings.personalityTextFontSize}px`,
                  color: '#1e293b',
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
