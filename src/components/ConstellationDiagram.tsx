import React, { useEffect, useRef } from 'react';
import { Modulation } from '../types/satellite';

interface Props {
  snrDb: number;
  isLocked: boolean;
  modulation: Modulation;
  compact?: boolean;
}

export const ConstellationDiagram: React.FC<Props> = ({
  snrDb,
  isLocked,
  modulation,
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.38;

    // Clear background
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Draw circular grid rings
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw I / Q axes
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX, height - 10);
    ctx.moveTo(10, centerY);
    ctx.lineTo(width - 10, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('Q', centerX + 4, 16);
    ctx.fillText('I', width - 14, centerY - 4);

    // Calculate constellation points based on modulation
    // QPSK has 4 points at 45, 135, 225, 315 deg
    // 8PSK has 8 points at multiples of 45 deg or 22.5 deg
    let baseAngles: number[] = [];
    if (modulation.includes('8PSK')) {
      baseAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
    } else {
      // QPSK
      baseAngles = [45, 135, 225, 315];
    }

    // Noise dispersion based on SNR
    // High SNR (e.g. 15dB) -> tight clusters (sigma ~ 3px)
    // Low SNR (e.g. 3dB) -> wide cloud (sigma ~ 26px)
    // Unlocked -> uniform random scatter
    const effectiveSnr = Math.max(0, snrDb);
    const noiseSigma = isLocked ? Math.max(2.5, 30 - effectiveSnr * 1.8) : 38;

    // Draw symbols
    const numPoints = compact ? 80 : 160;
    
    // Color palette: glowing cyan/emerald when locked, red/orange when noisy
    const symbolColor = isLocked
      ? (snrDb > 11 ? 'rgba(34, 197, 94, 0.75)' : 'rgba(56, 189, 248, 0.75)')
      : 'rgba(239, 68, 68, 0.4)';

    ctx.fillStyle = symbolColor;

    for (let i = 0; i < numPoints; i++) {
      let x = centerX;
      let y = centerY;

      if (isLocked) {
        // Pick one target constellation center
        const targetAngleDeg = baseAngles[i % baseAngles.length];
        const rad = (targetAngleDeg * Math.PI) / 180;
        const targetX = centerX + Math.cos(rad) * radius;
        const targetY = centerY + Math.sin(rad) * radius;

        // Add Box-Muller normal noise
        const u1 = Math.max(0.0001, Math.random());
        const u2 = Math.random();
        const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        const randStdNormal2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        x = targetX + randStdNormal * noiseSigma;
        y = targetY + randStdNormal2 * noiseSigma;
      } else {
        // Random unguided noise cloud
        const r = Math.random() * radius * 1.1;
        const th = Math.random() * Math.PI * 2;
        x = centerX + Math.cos(th) * r;
        y = centerY + Math.sin(th) * r;
      }

      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Target theoretical constellation centers (reference dots)
    if (isLocked) {
      ctx.fillStyle = '#f8fafc';
      for (const ang of baseAngles) {
        const rad = (ang * Math.PI) / 180;
        const tx = centerX + Math.cos(rad) * radius;
        const ty = centerY + Math.sin(rad) * radius;
        ctx.beginPath();
        ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [snrDb, isLocked, modulation, compact]);

  const size = compact ? 150 : 210;

  return (
    <div className="flex flex-col items-center">
      <div className="relative rounded-xl border border-slate-800 bg-[#060a12] p-2 shadow-inner">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-lg block"
        />
        <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400">
          I/Q DIAGRAM
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] font-mono font-medium text-slate-400">
          {modulation}
        </div>
      </div>
    </div>
  );
};
