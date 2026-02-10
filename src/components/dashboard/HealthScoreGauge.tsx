import { useMemo, memo } from 'react';
import type { HealthScore } from '../../types';
import { GlassCard } from '../shared/GlassCard';

interface HealthScoreGaugeProps {
  score: HealthScore;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'var(--accent-income)';
  if (score >= 40) return 'var(--accent-warning)';
  return 'var(--accent-expense)';
}

function getGradeLabel(grade: HealthScore['grade']): string {
  switch (grade) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Good';
    case 'fair': return 'Fair';
    case 'poor': return 'Needs Work';
  }
}

export const HealthScoreGauge = memo(function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const color = getScoreColor(score.overall);

  // 270-degree arc: from 135° (7 o'clock) to 405° (5 o'clock)
  const arcData = useMemo(() => {
    const size = 160;
    const strokeWidth = 12;
    const r = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    // Arc goes from 135° to 405° (270° sweep)
    const startAngle = 135;
    const endAngle = 405;
    const totalAngle = endAngle - startAngle; // 270

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    // Background arc endpoints
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));

    const bgPath = `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;

    // Fill arc: proportional to score
    const fillAngle = startAngle + (score.overall / 100) * totalAngle;
    const fx = cx + r * Math.cos(toRad(fillAngle));
    const fy = cy + r * Math.sin(toRad(fillAngle));
    const largeArc = (fillAngle - startAngle) > 180 ? 1 : 0;

    const fillPath = score.overall > 0
      ? `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${fx} ${fy}`
      : '';

    return { size, strokeWidth, bgPath, fillPath };
  }, [score.overall]);

  return (
    <GlassCard className="animate-fade-in-up stagger-2">
      <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-4">
        Financial Health
      </h3>

      <div className="flex flex-col items-center">
        {/* SVG Gauge */}
        <div className="relative">
          <svg width={arcData.size} height={arcData.size}>
            <path
              d={arcData.bgPath}
              fill="none"
              stroke="var(--divider)"
              strokeWidth={arcData.strokeWidth}
              strokeLinecap="round"
            />
            {arcData.fillPath && (
              <path
                d={arcData.fillPath}
                fill="none"
                stroke={color}
                strokeWidth={arcData.strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 8px ${color})` }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-[var(--text-primary)]">
              {score.overall}
            </span>
            <span
              className="text-xs font-medium mt-0.5"
              style={{ color }}
            >
              {getGradeLabel(score.grade)}
            </span>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="w-full flex flex-col gap-2 mt-4">
          {score.components.map((comp) => (
            <div key={comp.label} className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] w-24 truncate">
                {comp.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-[var(--divider)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${comp.score}%`,
                    backgroundColor: getScoreColor(comp.score),
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] w-6 text-right">
                {comp.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
});
