import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LayoutDashboard, FolderKanban, GitFork } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nexus-base flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-nexus-surface border border-nexus-border-bright rounded-2xl p-8 shadow-nexus-elevated space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>

        <span className="font-mono text-xs text-indigo-400 tracking-widest uppercase block">
          404 — Route Not Found
        </span>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
          Sector Coordinates Unrecognized
        </h1>

        <p className="text-xs sm:text-sm text-nexus-text-muted leading-relaxed">
          The requested system route does not exist or has been relocated by workspace orchestrator.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Command Dashboard
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>

        <div className="pt-4 border-t border-nexus-border flex items-center justify-center gap-4 text-xs text-nexus-text-dim">
          <button onClick={() => navigate('/projects')} className="hover:text-indigo-400 flex items-center gap-1">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>
          <span>•</span>
          <button onClick={() => navigate('/workflows')} className="hover:text-violet-400 flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>Pipelines</span>
          </button>
        </div>
      </div>
    </div>
  );
};
