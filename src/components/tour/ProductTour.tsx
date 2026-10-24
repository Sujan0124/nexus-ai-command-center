import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Zap, 
  Search, 
  GitFork, 
  FolderKanban, 
  Radio
} from 'lucide-react';
import { Button } from '../common/Button';

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  highlightAction?: string;
}

export const ProductTour: React.FC<ProductTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: 'Welcome to NEXUS — AI Command Center',
      tagline: 'One command center. Every workflow in motion.',
      description: 'NEXUS provides engineering, AI architecture, and DevSecOps teams with a single pane of glass to orchestrate multi-step autonomous pipelines, manage engineering projects, and monitor real-time telemetry.',
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      highlightAction: 'Executive KPI Cards & Velocity Telemetry',
    },
    {
      title: 'Global Omnisearch & Command Palette',
      tagline: 'Keyboard-first system navigation with Ctrl+K',
      description: 'Press Ctrl+K (or Cmd+K) anywhere across the application to instantly jump to projects, pipelines, change themes, trigger executions, or mark notifications as read without lifting your hands from the keyboard.',
      icon: <Search className="w-6 h-6 text-cyan-400" />,
      highlightAction: 'Press Ctrl+K anytime',
    },
    {
      title: 'Visual Workflow Canvas & Deterministic Engine',
      tagline: 'Interactive node graph with live step-by-step logs',
      description: 'Build robust pipelines with Input, Deterministic AI Summarizer, Conditional Branching, Delays, and Mock APIs. Toggle between the Sequencer and the Visual Canvas, and watch live terminal logs stream in real-time.',
      icon: <GitFork className="w-6 h-6 text-violet-400" />,
      highlightAction: 'Canvas view & live runner terminal',
    },
    {
      title: 'Initiatives, Milestones & Task Tracking',
      tagline: 'Track deliverables and velocity per repository',
      description: 'Organize high-priority engineering tasks with status filters, priority ranks, assignees, and target due dates. Project progress auto-computes as checklist tasks are resolved.',
      icon: <FolderKanban className="w-6 h-6 text-emerald-400" />,
      highlightAction: 'Task checklists and progress gauges',
    },
    {
      title: 'Mock Webhook Event Simulator',
      tagline: 'Simulate GitHub, CVE alerts, and support webhooks',
      description: 'Test incoming HTTP POST event triggers directly against your pipelines with realistic JSON payloads, simulated latency, and instant execution feedback.',
      icon: <Radio className="w-6 h-6 text-amber-400" />,
      highlightAction: 'Webhook Simulator in Header',
    },
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleFinish = () => {
    try {
      localStorage.setItem('nexus_tour_completed', 'true');
    } catch {}
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Tour Dialog Card */}
      <div className="relative w-full max-w-lg bg-nexus-surface border border-nexus-border-bright rounded-2xl shadow-nexus-elevated z-10 overflow-hidden p-6 sm:p-8 transform transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-nexus-text-dim hover:text-nexus-text rounded-lg hover:bg-nexus-elevated transition-colors"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Icon & Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-nexus-elevated border border-nexus-border flex items-center justify-center shadow-nexus-glow shrink-0">
            {step.icon}
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400 font-semibold block">
              Feature Tour · Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-nexus-text-dim block mt-0.5">
              {step.tagline}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-nexus-text mb-2">
          {step.title}
        </h2>
        <p className="text-xs sm:text-sm text-nexus-text-muted leading-relaxed mb-6">
          {step.description}
        </p>

        {/* Highlight Feature Banner */}
        {step.highlightAction && (
          <div className="p-3 rounded-xl bg-nexus-base border border-nexus-border text-xs text-indigo-300 flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold">{step.highlightAction}</span>
          </div>
        )}

        {/* Footer with Step Dots & Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-nexus-border">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full cursor-pointer transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-indigo-500'
                    : 'w-1.5 bg-nexus-elevated hover:bg-nexus-border-bright'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Back
              </Button>
            )}

            {isLast ? (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Check className="w-3.5 h-3.5" />}
                onClick={handleFinish}
              >
                Enter NEXUS
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
