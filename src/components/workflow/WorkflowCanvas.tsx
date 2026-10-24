import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  WorkflowStep, 
  StepType 
} from '../../types';
import { 
  FileText, 
  Sparkles, 
  Sliders, 
  Clock, 
  Network, 
  Terminal, 
  Settings2, 
  Trash2, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  onSelectStep: (step: WorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
  onAddStep: (type: StepType) => void;
  activeStepId?: string;
  failedStepId?: string;
  isExecuting?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  steps,
  onSelectStep,
  onDeleteStep,
  onAddStep,
  activeStepId,
  failedStepId,
  isExecuting = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [positions, setPositions] = useState<Record<string, NodePosition>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Initialize or update node positions in a neat vertical flow layout
  useEffect(() => {
    setPositions(prev => {
      const next: Record<string, NodePosition> = { ...prev };
      const startX = 280;
      const startY = 60;
      const nodeSpacingY = 170;

      steps.forEach((step, idx) => {
        if (!next[step.id]) {
          next[step.id] = {
            x: startX + (idx % 2 === 1 ? 40 : 0),
            y: startY + idx * nodeSpacingY,
          };
        }
      });
      return next;
    });
  }, [steps]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    const pos = positions[stepId] || { x: 0, y: 0 };
    setDraggingNodeId(stepId);
    setDragOffset({
      x: e.clientX / zoom - pos.x,
      y: e.clientY / zoom - pos.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    const newX = Math.max(20, Math.min(800, e.clientX / zoom - dragOffset.x));
    const newY = Math.max(20, Math.min(2000, e.clientY / zoom - dragOffset.y));

    setPositions(prev => ({
      ...prev,
      [draggingNodeId]: { x: newX, y: newY },
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const getStepIcon = (type: StepType) => {
    switch (type) {
      case 'input': return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'transform': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'condition': return <Sliders className="w-4 h-4 text-amber-400" />;
      case 'delay': return <Clock className="w-4 h-4 text-purple-400" />;
      case 'mock_api': return <Network className="w-4 h-4 text-emerald-400" />;
      case 'output': return <Terminal className="w-4 h-4 text-rose-400" />;
    }
  };

  // Build SVG connection lines
  const nodeWidth = 260;
  const nodeHeight = 110;

  const connections = useMemo(() => {
    const lines: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isBranch?: boolean;
      branchType?: 'true' | 'false';
      isActive?: boolean;
    }> = [];

    for (let i = 0; i < steps.length - 1; i++) {
      const fromStep = steps[i];
      const toStep = steps[i + 1];

      const fromPos = positions[fromStep.id];
      const toPos = positions[toStep.id];

      if (fromPos && toPos) {
        const isFromActive = activeStepId === fromStep.id;

        if (fromStep.type === 'condition') {
          // Dual branches from condition
          lines.push({
            id: `conn_${fromStep.id}_true`,
            x1: fromPos.x + nodeWidth * 0.35,
            y1: fromPos.y + nodeHeight,
            x2: toPos.x + nodeWidth * 0.5,
            y2: toPos.y,
            isBranch: true,
            branchType: 'true',
            isActive: isFromActive,
          });
          lines.push({
            id: `conn_${fromStep.id}_false`,
            x1: fromPos.x + nodeWidth * 0.75,
            y1: fromPos.y + nodeHeight,
            x2: toPos.x + nodeWidth * 0.85,
            y2: toPos.y,
            isBranch: true,
            branchType: 'false',
            isActive: isFromActive,
          });
        } else {
          // Standard linear connector
          lines.push({
            id: `conn_${fromStep.id}`,
            x1: fromPos.x + nodeWidth / 2,
            y1: fromPos.y + nodeHeight,
            x2: toPos.x + nodeWidth / 2,
            y2: toPos.y,
            isActive: isFromActive,
          });
        }
      }
    }
    return lines;
  }, [steps, positions, activeStepId]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-[620px] bg-nexus-base border border-nexus-border rounded-2xl overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(var(--color-border) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Floating Canvas Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-nexus-surface/90 backdrop-blur-md border border-nexus-border shadow-nexus-elevated">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.6))}
          className="p-1.5 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.6))}
          className="p-1.5 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-2 py-1 text-[11px] font-mono text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>

      {/* Floating Add Step Node Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-nexus-glow border border-indigo-500/40 text-xs font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Canvas Node</span>
        </button>

        {showAddMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-nexus-surface border border-nexus-border-bright rounded-2xl shadow-nexus-elevated py-1.5 z-30">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-nexus-text-dim border-b border-nexus-border mb-1">
              Select Step Type
            </div>
            {(['transform', 'condition', 'mock_api', 'delay', 'output'] as const).map(type => (
              <button
                key={type}
                onClick={() => {
                  onAddStep(type);
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-nexus-text hover:bg-nexus-elevated flex items-center gap-2.5 transition-colors capitalize"
              >
                {getStepIcon(type)}
                <span>{type.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoomable / Transformable Stage */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          transition: draggingNodeId ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {/* SVG Bezier Cables */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="wireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="trueWireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="falseWireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {connections.map(conn => {
            const dy = Math.max(40, (conn.y2 - conn.y1) * 0.5);
            const pathData = `M ${conn.x1} ${conn.y1} C ${conn.x1} ${conn.y1 + dy}, ${conn.x2} ${conn.y2 - dy}, ${conn.x2} ${conn.y2}`;

            const strokeColor = conn.branchType === 'true'
              ? 'url(#trueWireGrad)'
              : conn.branchType === 'false'
              ? 'url(#falseWireGrad)'
              : 'url(#wireGradient)';

            return (
              <g key={conn.id}>
                {/* Outer shadow glow */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={conn.branchType === 'true' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Core animated wire */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeDasharray={conn.isActive || isExecuting ? '6 4' : 'none'}
                  className={conn.isActive || isExecuting ? 'animate-pulse' : ''}
                  strokeLinecap="round"
                />

                {/* Connector Endpoint Rings */}
                <circle cx={conn.x1} cy={conn.y1} r="4" fill="#090B10" stroke={strokeColor} strokeWidth="2" />
                <circle cx={conn.x2} cy={conn.y2} r="4" fill="#090B10" stroke={strokeColor} strokeWidth="2" />

                {/* Branch label text if condition */}
                {conn.isBranch && (
                  <text
                    x={(conn.x1 + conn.x2) / 2}
                    y={(conn.y1 + conn.y2) / 2}
                    fill={conn.branchType === 'true' ? '#10B981' : '#F59E0B'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {conn.branchType === 'true' ? 'TRUE' : 'FALSE'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Draggable Step Nodes */}
        {steps.map(step => {
          const pos = positions[step.id] || { x: 280, y: 50 };
          const isActive = activeStepId === step.id;
          const isFailed = failedStepId === step.id;

          return (
            <div
              key={step.id}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: `${nodeWidth}px`,
              }}
              onMouseDown={e => handleMouseDown(e, step.id)}
              className={`absolute rounded-2xl border transition-shadow cursor-grab active:cursor-grabbing p-3.5 z-10 shadow-nexus-elevated ${
                isFailed
                  ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/50'
                  : isActive
                  ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/50 shadow-nexus-glow'
                  : 'bg-nexus-surface/95 border-nexus-border hover:border-nexus-border-bright'
              }`}
            >
              {/* Node Input Port Socket */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-nexus-base border-2 border-indigo-400" />

              {/* Node Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-nexus-elevated border border-nexus-border">
                    {getStepIcon(step.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-nexus-text-dim block leading-none">
                      Step {step.order}
                    </span>
                    <span className="text-xs font-bold text-nexus-text truncate block mt-0.5 max-w-[140px]">
                      {step.title}
                    </span>
                  </div>
                </div>

                {/* Node Status Badge */}
                {isFailed ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : isActive ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 status-ring-pulse" />
                ) : (
                  <span className="text-[10px] font-mono text-nexus-text-dim uppercase px-1.5 py-0.5 rounded bg-nexus-elevated border border-nexus-border">
                    {step.type}
                  </span>
                )}
              </div>

              {/* Node Body / Config Snippet */}
              <p className="text-[11px] text-nexus-text-muted line-clamp-1 leading-relaxed">
                {step.description}
              </p>

              <div className="mt-2 text-[10px] font-mono text-nexus-text-dim bg-nexus-base/80 px-2 py-1 rounded-md border border-nexus-border/60 truncate">
                {step.type === 'transform' && `op: ${step.config.transformOperation || 'ai_summarize'}`}
                {step.type === 'condition' && `test: [${step.config.conditionField}] ${step.config.conditionOperator}`}
                {step.type === 'mock_api' && `${step.config.apiMethod || 'POST'} ${step.config.apiEndpoint || '/api'}`}
                {step.type === 'delay' && `wait: ${step.config.delayDurationMs || 400}ms`}
                {step.type === 'input' && `payload: default`}
                {step.type === 'output' && `target: ${step.config.destination || 'console'}`}
              </div>

              {/* Node Actions Toolbar */}
              <div className="flex items-center justify-end gap-1 mt-2.5 pt-2 border-t border-nexus-border">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSelectStep(step);
                  }}
                  className="p-1 text-nexus-text-dim hover:text-indigo-400 rounded hover:bg-nexus-elevated transition-colors text-[11px] flex items-center gap-1 font-medium"
                  title="Configure step parameters"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Config</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteStep(step.id);
                  }}
                  className="p-1 text-nexus-text-dim hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                  title="Delete node"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Node Output Port Sockets */}
              {step.type === 'condition' ? (
                <>
                  <div
                    className="absolute -bottom-1.5 left-[35%] -translate-x-1/2 w-3 h-3 rounded-full bg-nexus-base border-2 border-emerald-400"
                    title="True Branch"
                  />
                  <div
                    className="absolute -bottom-1.5 left-[75%] -translate-x-1/2 w-3 h-3 rounded-full bg-nexus-base border-2 border-amber-400"
                    title="False Branch"
                  />
                </>
              ) : (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-nexus-base border-2 border-cyan-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
