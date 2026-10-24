import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitFork, 
  Search, 
  Plus, 
  Play, 
  Copy, 
  Trash2, 
  Clock, 
  Power, 
  Zap, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  FileCode
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Workflow, WorkflowStatus, WorkflowTrigger } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { WorkflowFormModal } from '../components/workflow/WorkflowFormModal';
import { runWorkflow } from '../engine/workflowEngine';
import { useToast } from '../context/ToastContext';

export const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const { 
    workflows, 
    duplicateWorkflow, 
    deleteWorkflow, 
    toggleWorkflowStatus, 
    recordExecution 
  } = useAppData();
  const { success, error: toastError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [triggerFilter, setTriggerFilter] = useState<string>('ALL');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);

  // Quick Run state
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(w => {
      const matchesSearch = 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
      const matchesTrigger = triggerFilter === 'ALL' || w.trigger === triggerFilter;

      return matchesSearch && matchesStatus && matchesTrigger;
    });
  }, [workflows, searchQuery, statusFilter, triggerFilter]);

  const handleQuickRun = async (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    setRunningWorkflowId(workflow.id);

    try {
      const execution = await runWorkflow(workflow);
      recordExecution(execution);

      if (execution.status === 'success') {
        success('Workflow Executed Successfully', `${workflow.name} ran ${execution.logs.length} steps in ${execution.durationMs}ms.`);
      } else {
        toastError('Execution Failed', execution.errorMessage || 'Step failed.');
      }
    } catch (err: any) {
      toastError('Execution Error', err.message);
    } finally {
      setRunningWorkflowId(null);
    }
  };

  const handleDuplicate = (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned = duplicateWorkflow(workflow.id);
    success('Workflow Duplicated', `Created "${cloned.name}"`);
  };

  const handleToggleStatus = (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWorkflowStatus(workflow.id);
    const next = workflow.status === 'active' ? 'deactivated' : 'activated';
    success(`Workflow ${next}`);
  };

  const handleDeleteConfirm = () => {
    if (workflowToDelete) {
      deleteWorkflow(workflowToDelete.id);
      success('Workflow Deleted', `"${workflowToDelete.name}" was permanently removed.`);
      setWorkflowToDelete(null);
    }
  };

  const getTriggerBadge = (trigger: WorkflowTrigger) => {
    switch (trigger) {
      case 'webhook': return <Badge variant="indigo" size="sm">Webhook</Badge>;
      case 'scheduled': return <Badge variant="cyan" size="sm">Scheduled</Badge>;
      case 'event': return <Badge variant="emerald" size="sm">Event Stream</Badge>;
      case 'manual': return <Badge variant="amber" size="sm">Manual</Badge>;
      default: return <Badge variant="slate" size="sm">{trigger}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
            AI Workflow Pipelines
          </h1>
          <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
            Build, test, and execute deterministic multi-step AI orchestration graphs.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Workflow
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-nexus-text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search pipelines by name, tags, description..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs sm:text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={triggerFilter}
          onChange={e => setTriggerFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none"
        >
          <option value="ALL">All Triggers</option>
          <option value="webhook">Webhook</option>
          <option value="scheduled">Scheduled</option>
          <option value="event">Event Stream</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      {/* Workflow Cards */}
      {filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={<GitFork className="w-6 h-6" />}
          title="No pipelines found"
          description="Try clearing search filters or create a new automated workflow."
          actionText="Create Workflow"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkflows.map(workflow => {
            const isRunning = runningWorkflowId === workflow.id;

            return (
              <div
                key={workflow.id}
                onClick={() => navigate(`/workflows/${workflow.id}`)}
                className="group bg-nexus-surface border border-nexus-border hover:border-nexus-border-bright rounded-2xl p-5 shadow-sm hover:shadow-nexus-card transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      {getTriggerBadge(workflow.trigger)}
                      <Badge
                        size="sm"
                        variant={workflow.status === 'active' ? 'emerald' : 'slate'}
                        dot={workflow.status === 'active'}
                      >
                        {workflow.status}
                      </Badge>
                    </div>

                    {/* Quick run button */}
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={isRunning}
                      leftIcon={<Play className="w-3.5 h-3.5 text-indigo-400" />}
                      onClick={e => handleQuickRun(workflow, e)}
                      title="Execute workflow immediately"
                      className="px-2.5 py-1 text-xs"
                    >
                      Run
                    </Button>
                  </div>

                  <h3 className="text-base font-semibold text-nexus-text group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {workflow.name}
                  </h3>
                  <p className="text-xs text-nexus-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {workflow.description}
                  </p>

                  {/* Step tags preview */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="text-[10px] font-mono text-nexus-text-dim px-2 py-0.5 rounded bg-nexus-base border border-nexus-border">
                      {workflow.steps.length} {workflow.steps.length === 1 ? 'step' : 'steps'}
                    </span>
                    {workflow.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] text-nexus-text-dim px-1.5 py-0.5 rounded bg-nexus-base"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer with execution metrics */}
                <div className="pt-4 mt-4 border-t border-nexus-border">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div className="p-1.5 rounded-lg bg-nexus-base">
                      <span className="text-[10px] text-nexus-text-dim block">Executions</span>
                      <span className="font-semibold text-nexus-text font-mono">
                        {workflow.executionCount}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-nexus-base">
                      <span className="text-[10px] text-nexus-text-dim block">Success</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {workflow.successRate}%
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-nexus-base">
                      <span className="text-[10px] text-nexus-text-dim block">Avg Latency</span>
                      <span className="font-semibold text-cyan-400 font-mono">
                        {workflow.avgDurationMs}ms
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between text-xs text-nexus-text-dim" onClick={e => e.stopPropagation()}>
                    <span>Owner: <strong className="text-nexus-text-muted">{workflow.owner}</strong></span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => handleToggleStatus(workflow, e)}
                        className="p-1 text-nexus-text-dim hover:text-nexus-text rounded hover:bg-nexus-elevated transition-colors"
                        title={workflow.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => handleDuplicate(workflow, e)}
                        className="p-1 text-nexus-text-dim hover:text-nexus-text rounded hover:bg-nexus-elevated transition-colors"
                        title="Duplicate workflow"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setWorkflowToDelete(workflow);
                        }}
                        className="p-1 text-nexus-text-dim hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                        title="Delete workflow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Workflow Modal */}
      <WorkflowFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={workflowToDelete !== null}
        onClose={() => setWorkflowToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Workflow Pipeline?"
        message={`Are you sure you want to permanently delete "${workflowToDelete?.name}"? All execution history will be lost.`}
        confirmText="Delete Workflow"
        isDestructive={true}
      />
    </div>
  );
};
