import React, { useState } from 'react';

export interface DonutItem {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutItem[];
  centerLabel?: string;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel = 'Total',
  size = 200,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const activeItem = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 overflow-visible"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--color-bg-elevated)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {data.map((item, idx) => {
            const percent = item.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const isHovered = hoverIndex === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xs font-medium text-nexus-text-muted">
            {activeItem ? activeItem.label : centerLabel}
          </span>
          <span className="text-xl font-bold tracking-tight text-nexus-text">
            {activeItem ? activeItem.value.toLocaleString() : total.toLocaleString()}
          </span>
          {activeItem && (
            <span className="text-[10px] text-nexus-text-dim">
              {((activeItem.value / total) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex-1 space-y-2 w-full">
        {data.map((item, idx) => {
          const percent = ((item.value / total) * 100).toFixed(1);
          const isHovered = hoverIndex === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                isHovered ? 'bg-nexus-elevated' : 'hover:bg-nexus-elevated/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-nexus-text truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <span className="font-semibold text-nexus-text">{item.value}</span>
                <span className="text-nexus-text-dim">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
