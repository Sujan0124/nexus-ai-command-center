import React, { useState } from 'react';

export interface DataPoint {
  date: string;
  value: number;
  secondaryValue?: number;
}

export interface TimeSeriesChartProps {
  data: DataPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  unit?: string;
  color?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  primaryLabel = 'Current Period',
  secondaryLabel = 'Previous Period',
  height = 240,
  unit = '',
  color = '#6366F1',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-nexus-text-muted text-sm border border-nexus-border rounded-xl">
        No execution data available for selected period.
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartWidth = 700;
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const allValues = data.flatMap(d => [d.value, d.secondaryValue ?? d.value]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues) * 1.15 || 10;

  const getX = (idx: number) => padding.left + (idx / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  // Build primary path
  const primaryPoints = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const primaryLinePath = `M ${primaryPoints.join(' L ')}`;
  const primaryAreaPath = `${primaryLinePath} L ${getX(data.length - 1)},${padding.top + innerHeight} L ${getX(0)},${padding.top + innerHeight} Z`;

  // Secondary path if available
  const hasSecondary = data.some(d => d.secondaryValue !== undefined);
  const secondaryPoints = hasSecondary ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`) : [];
  const secondaryLinePath = hasSecondary ? `M ${secondaryPoints.join(' L ')}` : '';

  const hoveredData = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="relative w-full">
      {/* Legend & Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-medium text-nexus-text">{primaryLabel}</span>
          </div>
          {hasSecondary && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-400" />
              <span className="text-nexus-text-muted">{secondaryLabel}</span>
            </div>
          )}
        </div>

        {hoveredData && (
          <div className="text-right">
            <span className="text-nexus-text-dim mr-2">{hoveredData.date}:</span>
            <span className="font-bold text-nexus-text">
              {hoveredData.value.toLocaleString()} {unit}
            </span>
            {hoveredData.secondaryValue !== undefined && (
              <span className="text-nexus-text-muted ml-2">
                (prev: {hoveredData.secondaryValue.toLocaleString()} {unit})
              </span>
            )}
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="90%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerHeight * pct;
            const val = Math.round(maxVal - (pct * (maxVal - minVal)));
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--color-text-dim)"
                  className="font-mono"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={primaryAreaPath} fill="url(#areaGradient)" />

          {/* Secondary dashed line if present */}
          {hasSecondary && (
            <path
              d={secondaryLinePath}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Primary solid line */}
          <path
            d={primaryLinePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {data.map((d, idx) => {
            // Show every few labels to prevent overlap
            const step = Math.ceil(data.length / 7);
            if (idx % step !== 0 && idx !== data.length - 1) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={chartHeight - 8}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-text-dim)"
              >
                {d.date}
              </text>
            );
          })}

          {/* Hover interaction points */}
          {data.map((d, idx) => {
            const x = getX(idx);
            const isHovered = hoverIndex === idx;

            return (
              <g key={idx}>
                {/* Invisible hover trigger columns */}
                <rect
                  x={x - (innerWidth / data.length) / 2}
                  y={padding.top}
                  width={innerWidth / data.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                />

                {isHovered && (
                  <>
                    {/* Vertical indicator line */}
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="var(--color-text-muted)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />

                    {/* Primary Dot */}
                    <circle
                      cx={x}
                      cy={getY(d.value)}
                      r="5"
                      fill={color}
                      stroke="var(--color-bg-surface)"
                      strokeWidth="2.5"
                    />

                    {/* Secondary Dot if present */}
                    {d.secondaryValue !== undefined && (
                      <circle
                        cx={x}
                        cy={getY(d.secondaryValue)}
                        r="4"
                        fill="#64748B"
                        stroke="var(--color-bg-surface)"
                        strokeWidth="2"
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Screen Reader Data Table */}
      <div className="sr-only">
        <table>
          <caption>{primaryLabel} Time Series Data</caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>Value</th>
              {hasSecondary && <th>Previous</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.date}</td>
                <td>{d.value}</td>
                {hasSecondary && <td>{d.secondaryValue}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
