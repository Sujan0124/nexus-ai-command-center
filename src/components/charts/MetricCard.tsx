import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. +14.2 or -3.1
  periodText?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string;
  sparklineData?: number[];
  accentColor?: 'indigo' | 'cyan' | 'emerald' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  periodText = 'vs last 30d',
  icon,
  trend,
  tooltip,
  sparklineData = [24, 28, 22, 35, 42, 39, 51, 48, 62],
  accentColor = 'indigo',
}) => {
  const isPositive = (change ?? 0) > 0;
  const isNeutral = (change ?? 0) === 0;

  const colorClasses = {
    indigo: 'text-indigo-400 group-hover:border-indigo-500/30',
    cyan: 'text-cyan-400 group-hover:border-cyan-500/30',
    emerald: 'text-emerald-400 group-hover:border-emerald-500/30',
    amber: 'text-amber-400 group-hover:border-amber-500/30',
  }[accentColor];

  // SVG Sparkline path calculation
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 80;
  const height = 30;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={`group relative bg-nexus-surface border border-nexus-border hover:border-nexus-border-bright rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-nexus-card ${colorClasses}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-nexus-text-muted flex items-center gap-1.5">
          {title}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-nexus-text-dim hover:text-nexus-text">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-nexus-elevated border border-nexus-border text-nexus-text-muted group-hover:text-nexus-text transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-nexus-text">
          {value}
        </div>

        {/* Mini Sparkline */}
        <div className="shrink-0 w-20 h-8 opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md ${
              isNeutral
                ? 'bg-slate-500/10 text-slate-400'
                : isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {isPositive ? `+${change}%` : `${change}%`}
          </span>
        )}
        <span className="text-nexus-text-dim">{periodText}</span>
      </div>
    </div>
  );
};
