import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";

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
    
    const bg = isDark ? '#0a0a0a' : '#fafafa';
    const text = isDark ? '#e8e8e8' : '#111111';
    const textMuted = isDark ? '#888888' : '#555555';
    const accent = isDark ? '#a78bfa' : '#7c3aed';
    const border = isDark ? '#1f1f1f' : '#e2e2e2';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, accent);
    gradient.addColorStop(1, isDark ? '#c4b5fd' : '#6d28d9');
    ctx.fillStyle = gradient;
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
    ctx.fillStyle = isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)';
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
    ctx.font = '600 76px "Inter", sans-serif';
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
    ctx.font = '600 36px "Inter", sans-serif';
    ctx.fillText('本人要約', padding, currentY);

    currentY += 70;
    ctx.fillStyle = textMuted;
    ctx.font = '400 38px "Inter", sans-serif';
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
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        alert('共有に失敗しました。');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center">
      <Dropdown shouldBlockScroll={false}>
        <DropdownTrigger>
          <Button 
            size="sm"
            className="text-default-600 font-medium px-3 bg-transparent hover:bg-default-100"
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              この記事をシェア
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Share Options" onAction={(key) => {
          if (key === 'ig') {
            handleIgShare();
          } else if (key === 'twitter') {
            window.open(xShareUrl, '_blank', 'noopener,noreferrer');
          }
        }}>
          <DropdownItem key="twitter" textValue="X にポスト">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X にポスト
            </div>
          </DropdownItem>
          <DropdownItem key="ig" textValue="Instagram に共有" className="text-pink-500 hover:text-pink-600">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              {isGenerating ? "画像生成中..." : "Instagram に共有"}
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
