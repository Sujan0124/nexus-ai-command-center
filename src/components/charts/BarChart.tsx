import React, { useState } from 'react';

export interface BarItem {
  label: string;
  success: number;
  failure: number;
}

export interface BarChartProps {
  data: BarItem[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 220 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-nexus-text-muted text-sm border border-nexus-border rounded-xl">
        No bar chart comparison data.
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 35, left: 40 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.success, d.failure))) * 1.15 || 10;
  const slotWidth = innerWidth / data.length;
  const barWidth = Math.min(22, slotWidth * 0.35);

  const getY = (val: number) => padding.top + innerHeight - (val / maxVal) * innerHeight;

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-nexus-text font-medium">Successful</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-nexus-text-muted">Failed / Errors</span>
          </div>
        </div>

        {hoverIndex !== null && (
          <div className="text-right">
            <span className="text-nexus-text-dim mr-2">{data[hoverIndex].label}:</span>
            <span className="text-emerald-400 font-semibold mr-2">{data[hoverIndex].success} ok</span>
            <span className="text-rose-400 font-semibold">{data[hoverIndex].failure} fail</span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible select-none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = padding.top + innerHeight * pct;
          const val = Math.round(maxVal - pct * maxVal);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-text-dim)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const slotX = padding.left + idx * slotWidth;
          const centerSlot = slotX + slotWidth / 2;
          const isHovered = hoverIndex === idx;

          const successY = getY(item.success);
          const successH = padding.top + innerHeight - successY;

          const failY = getY(item.failure);
          const failH = padding.top + innerHeight - failY;

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
            >
              {/* Slot background on hover */}
              {isHovered && (
                <rect
                  x={slotX}
                  y={padding.top}
                  width={slotWidth}
                  height={innerHeight}
                  fill="var(--color-bg-elevated)"
                  rx="6"
                  opacity="0.6"
                />
              )}

              {/* Success bar */}
              <rect
                x={centerSlot - barWidth - 2}
                y={successY}
                width={barWidth}
                height={Math.max(2, successH)}
                fill="#10B981"
                rx="3"
                className="transition-all duration-150"
                opacity={hoverIndex === null || isHovered ? 1 : 0.6}
              />

              {/* Failure bar */}
              <rect
                x={centerSlot + 2}
                y={failY}
                width={barWidth}
                height={Math.max(2, failH)}
                fill="#EF4444"
                rx="3"
                className="transition-all duration-150"
                opacity={hoverIndex === null || isHovered ? 1 : 0.6}
              />

              {/* Label */}
              <text
                x={centerSlot}
                y={chartHeight - 12}
                textAnchor="middle"
                fontSize="10"
                fill={isHovered ? 'var(--color-text-main)' : 'var(--color-text-dim)'}
                className="font-medium"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
