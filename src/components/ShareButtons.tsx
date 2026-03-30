import React, { useState } from 'react';
import { Button } from './starwind/button';

interface ShareButtonsProps {
  title: string;
  date: Date | string; // Dates passed from Astro are serialized or Date objects.
  description: string;
  url: string;
}

export default function ShareButtons({ title, date, description, url }: ShareButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Format date correctly
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + ' - hamaryo')}&url=${encodeURIComponent(url)}`;

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  const generateShareImage = async (): Promise<File> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    
    const bg = isDark ? '#0f0f10' : '#ffffff';
    const text = isDark ? '#f4f4f5' : '#111111';
    const textMuted = isDark ? '#a1a1aa' : '#616161';
    const accent = isDark ? '#ffffff' : '#111111';
    const border = isDark ? '#2a2a2d' : '#e3e3e3';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = border;
    ctx.fillRect(0, 0, canvas.width, 32);

    const padding = 120;
    const contentWidth = canvas.width - padding * 2;
    
    ctx.font = '500 52px "JetBrains Mono", monospace';
    ctx.fillStyle = text;
    ctx.fillText('hama', padding, 220);
    const hamaWidth = ctx.measureText('hama').width;
    ctx.fillStyle = accent;
    ctx.fillText('.', padding + hamaWidth, 220);
    const dotWidth = ctx.measureText('.').width;
    ctx.fillStyle = text;
    ctx.fillText('ryo', padding + hamaWidth + dotWidth, 220);
    
    const badgeY = 320;
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.06)';
    ctx.beginPath();
    ctx.roundRect(padding, badgeY, 190, 60, 30);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = accent;
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEW POST', padding + 95, badgeY + 30);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = textMuted;
    ctx.font = '400 34px "JetBrains Mono", monospace';
    ctx.fillText(formattedDate, padding, badgeY + 160);

    ctx.fillStyle = text;
    ctx.font = '700 76px "Manrope", sans-serif';
    const titleLines = wrapText(ctx, title, contentWidth);
    let currentY = badgeY + 300;
    const titleLineHeight = 110;
    
    for (const line of titleLines) {
      if (currentY > 1200) {
        ctx.fillText('...', padding, currentY);
        currentY += titleLineHeight;
        break;
      }
      ctx.fillText(line, padding, currentY);
      currentY += titleLineHeight;
    }

    currentY += 40;
    ctx.fillStyle = border;
    ctx.fillRect(padding, currentY, contentWidth, 2);

    currentY += 100;
    ctx.fillStyle = accent;
    ctx.font = '700 36px "Manrope", sans-serif';
    ctx.fillText('本人要約', padding, currentY);

    currentY += 70;
    ctx.fillStyle = textMuted;
    ctx.font = '500 38px "Manrope", sans-serif';
    const descLines = wrapText(ctx, description, contentWidth);
    const descLineHeight = 65;
    
    for (let i = 0; i < descLines.length; i++) {
      if (i === 6) break;
      let lineText = descLines[i];
      if (i === 5 && descLines.length > 6) {
        lineText = lineText.replace(/...$/, '...');
      }
      ctx.fillText(lineText, padding, currentY);
      currentY += descLineHeight;
    }

    const domain = window.location.hostname || 'hamaryo.dev';
    ctx.textAlign = 'center';
    ctx.fillStyle = textMuted;
    ctx.font = '400 38px "JetBrains Mono", monospace';
    ctx.fillText(`Read more on ${domain}/blog`, canvas.width / 2, canvas.height - 120);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], 'share-story.png', { type: 'image/png' }));
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });
  };

  const handleIgShare = async () => {
    setIsGenerating(true);
    try {
      const file = await generateShareImage();
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: title
        });
      } else {
        alert('お使いのブラウザは Web Share API による画像共有に対応していません。');
      }
    } catch (err: any) {
      if (!(err instanceof Error) || err.name !== 'AbortError') {
        console.error('Share error:', err);
        alert('共有に失敗しました。');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleXShare = () => {
    window.open(xShareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleXShare}>
          X にポスト
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleIgShare} disabled={isGenerating}>
          {isGenerating ? '画像生成中...' : '共有'}
        </Button>
      </div>
    </div>
  );
}
