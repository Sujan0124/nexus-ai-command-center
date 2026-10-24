import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Settings2, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Layers, 
  Save, 
  FileText,
  Sliders,
  Sparkles,
  Network,
  Radio
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { 
  WorkflowStep, 
  StepType, 
  StepConfig, 
  WorkflowExecution, 
  StepExecutionLog 
} from '../types';
import { runWorkflow } from '../engine/workflowEngine';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { WorkflowCanvas } from '../components/workflow/WorkflowCanvas';
import { WebhookSimulatorModal } from '../components/workflow/WebhookSimulatorModal';
import { useToast } from '../context/ToastContext';

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workflows, executions, saveWorkflowSteps, recordExecution } = useAppData();
  const { success, error: toastError, info } = useToast();

  const workflow = workflows.find(w => w.id === id);

  // Local draft steps
  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    return workflow ? [...workflow.steps].sort((a, b) => a.order - b.order) : [];
  });

  // Step config modal state
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);

  // View mode: Sequencer or Visual Node Canvas
  const [viewMode, setViewMode] = useState<'sequencer' | 'canvas'>('canvas');
  const [showWebhookSimulator, setShowWebhookSimulator] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | undefined>();

  // Execution runner state
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeExecution, setActiveExecution] = useState<WorkflowExecution | null>(null);
  const [executionLogs, setExecutionLogs] = useState<StepExecutionLog[]>([]);
  const [testPayloadInput, setTestPayloadInput] = useState<string>('');
  const [showRunModal, setShowRunModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Import / Export JSON ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!workflow) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-nexus-text">Workflow Not Found</h2>
        <Button variant="primary" size="sm" onClick={() => navigate('/workflows')}>
          Back to Workflows
        </Button>
      </div>
    );
  }

  // Save Steps to context
  const handleSaveDraft = () => {
    saveWorkflowSteps(workflow.id, steps);
    success('Workflow Saved', 'All pipeline step configurations and ordering updated.');
  };

  // Reorder steps
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const updated = [...steps];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const renumbered = updated.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(renumbered);
  };

  // Delete step
  const deleteStep = (stepId: string) => {
    if (steps.length <= 1) {
      toastError('Cannot Delete Step', 'A pipeline must have at least one step.');
      return;
    }
    const updated = steps.filter(s => s.id !== stepId).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(updated);
  };

  // Add new step
  const addStep = (type: StepType) => {
    const newStepId = `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const stepOrder = steps.length + 1;

    let defaultConfig: StepConfig = {};
    let title = 'New Step';
    let description = 'Step configuration';

    if (type === 'input') {
      title = 'Input Trigger';
      description = 'Receives incoming data payload';
      defaultConfig = { defaultPayload: '{"message": "Hello NEXUS"}' };
    } else if (type === 'transform') {
      title = 'AI Summarize & Transform';
      description = 'Performs deterministic text analysis';
      defaultConfig = { transformOperation: 'ai_summarize' };
    } else if (type === 'condition') {
      title = 'Evaluate Condition';
      description = 'Branch decision on payload field';
      defaultConfig = { conditionField: 'status', conditionOperator: 'equals', conditionValue: 'ok' };
    } else if (type === 'delay') {
      title = 'Backoff Delay';
      description = 'Simulates scheduled backoff interval';
      defaultConfig = { delayDurationMs: 400 };
    } else if (type === 'mock_api') {
      title = 'Mock Gateway API Call';
      description = 'Simulated microservice HTTP request';
      defaultConfig = { apiEndpoint: '/api/v1/services/verify', apiMethod: 'POST', simulatedLatencyMs: 300, simulatedStatus: 200 };
    } else if (type === 'output') {
      title = 'Dispatched Output';
      description = 'Delivers result to destination';
      defaultConfig = { destination: 'console', outputTemplate: 'Result: {{data}}' };
    }

    const newStep: WorkflowStep = {
      id: newStepId,
      title,
      description,
      type,
      config: defaultConfig,
      order: stepOrder,
    };

    setSteps([...steps, newStep]);
    setEditingStep(newStep);
  };

  // Save Step Configuration from modal
  const handleUpdateStepConfig = (updated: WorkflowStep) => {
    setSteps(steps.map(s => (s.id === updated.id ? updated : s)));
    setEditingStep(null);
    success('Step Configured');
  };

  // Execute Workflow
  const handleStartExecution = async () => {
    setIsExecuting(true);
    setExecutionLogs([]);
    setActiveExecution(null);
    setShowRunModal(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let payload: any = undefined;
    if (testPayloadInput.trim()) {
      try {
        payload = JSON.parse(testPayloadInput);
      } catch {
        payload = testPayloadInput;
      }
    }

    try {
      const activeWf = { ...workflow, steps };
      const result = await runWorkflow(activeWf, {
        inputPayload: payload,
        signal: controller.signal,
        onStepProgress: log => {
          setActiveStepId(log.stepId);
          setExecutionLogs(prev => [...prev, log]);
        },
      });

      setActiveExecution(result);
      recordExecution(result);

      if (result.status === 'success') {
        success('Pipeline Executed', `All ${result.logs.length} steps completed successfully in ${result.durationMs}ms.`);
      } else if (result.status === 'cancelled') {
        info('Execution Cancelled', 'Runner was aborted by user.');
      } else {
        toastError('Pipeline Execution Failed', result.errorMessage || 'Step failed.');
      }
    } catch (err: any) {
      toastError('Execution Fatal Error', err.message);
    } finally {
      setIsExecuting(false);
      abortControllerRef.current = null;
    }
  };

  // Abort execution
  const handleAbortExecution = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Export Workflow JSON
  const handleExportJson = () => {
    const exportData = {
      ...workflow,
      steps,
      schemaVersion: 'nexus.workflow.v2',
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}-definition.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Workflow Exported', 'Downloaded workflow JSON definition.');
  };

  // Import Workflow JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.steps && Array.isArray(parsed.steps)) {
          setSteps(parsed.steps);
          success('Workflow Imported', `Loaded ${parsed.steps.length} steps from JSON.`);
        } else {
          toastError('Invalid Format', 'JSON missing required "steps" array.');
        }
      } catch (err: any) {
        toastError('Import Error', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getStepTypeIcon = (type: StepType) => {
    switch (type) {
      case 'input': return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'transform': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'condition': return <Sliders className="w-4 h-4 text-amber-400" />;
      case 'delay': return <Clock className="w-4 h-4 text-purple-400" />;
      case 'mock_api': return <Network className="w-4 h-4 text-emerald-400" />;
      case 'output': return <Terminal className="w-4 h-4 text-rose-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const pastExecutions = executions.filter(e => e.workflowId === workflow.id);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workflows')}
            className="p-1.5 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
            aria-label="Back to workflows"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">{workflow.id.toUpperCase()}</span>
              <Badge size="sm" variant={workflow.status === 'active' ? 'emerald' : 'slate'} dot={workflow.status === 'active'}>
                {workflow.status}
              </Badge>
              <Badge size="sm" variant="indigo">{workflow.trigger}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text mt-0.5">
              {workflow.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle: Canvas vs Sequencer */}
          <div className="flex items-center rounded-xl bg-nexus-surface border border-nexus-border p-1 text-xs">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                viewMode === 'canvas' ? 'bg-nexus-elevated text-nexus-text shadow-sm' : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
            >
              Visual Canvas
            </button>
            <button
              onClick={() => setViewMode('sequencer')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                viewMode === 'sequencer' ? 'bg-nexus-elevated text-nexus-text shadow-sm' : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
            >
              Sequencer
            </button>
          </div>

          {/* Webhook simulator trigger */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Radio className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setShowWebhookSimulator(true)}
          >
            Simulate Webhook
          </Button>

          {/* JSON Export & Import */}
          <button
            onClick={handleExportJson}
            className="p-2 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-xl border border-nexus-border transition-colors text-xs flex items-center gap-1.5"
            title="Export workflow definition JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-xl border border-nexus-border transition-colors text-xs flex items-center gap-1.5"
            title="Import workflow JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Save className="w-4 h-4 text-indigo-400" />}
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Play className="w-4 h-4" />}
            onClick={() => setShowRunModal(true)}
          >
            Test & Run Pipeline
          </Button>
        </div>
      </div>

      {/* Editor & Step Sequencer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Step Sequence or Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === 'canvas' ? (
            <WorkflowCanvas
              steps={steps}
              onSelectStep={setEditingStep}
              onDeleteStep={deleteStep}
              onAddStep={addStep}
              activeStepId={activeStepId}
              failedStepId={activeExecution?.failedStepId}
              isExecuting={isExecuting}
            />
          ) : (
            <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-nexus-text">Pipeline Step Sequencer</h2>
                  <p className="text-xs text-nexus-text-muted mt-0.5">
                    Ordered steps pass typed outputs down the execution chain deterministically.
                  </p>
                </div>

                {/* Add Step Dropdown */}
                <div className="flex items-center gap-1">
                  {(['transform', 'condition', 'mock_api', 'delay', 'output'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => addStep(type)}
                      className="px-2 py-1 rounded-lg bg-nexus-base hover:bg-nexus-elevated border border-nexus-border text-[11px] text-nexus-text-muted hover:text-nexus-text transition-colors capitalize flex items-center gap-1"
                      title={`Add ${type} step`}
                    >
                      <Plus className="w-3 h-3 text-indigo-400" />
                      <span>{type.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step list with connectors */}
              <div className="space-y-3 relative">
                {steps.map((step, idx) => (
                  <div key={step.id} className="relative">
                    {/* Step Connector Line */}
                    {idx > 0 && (
                      <div className="w-0.5 h-3 bg-indigo-500/30 mx-auto -my-1" />
                    )}

                    <div className="bg-nexus-elevated/70 border border-nexus-border hover:border-nexus-border-bright rounded-xl p-4 transition-all flex items-start justify-between gap-3 shadow-sm">
                      {/* Left: Step indicator and type icon */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-nexus-surface border border-nexus-border flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {getStepTypeIcon(step.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-nexus-text">{step.title}</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-nexus-base border border-nexus-border text-nexus-text-dim">
                              Step {step.order} · {step.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Config Summary snippet */}
                          <div className="mt-2 text-[11px] font-mono text-nexus-text-dim bg-nexus-base/60 p-2 rounded-lg border border-nexus-border/60 overflow-x-auto">
                            {step.type === 'transform' && `Operation: ${step.config.transformOperation || 'uppercase'}`}
                            {step.type === 'condition' && `If [${step.config.conditionField}] ${step.config.conditionOperator} "${step.config.conditionValue}"`}
                            {step.type === 'mock_api' && `${step.config.apiMethod || 'POST'} ${step.config.apiEndpoint || '/api/v1/mock'} (${step.config.simulatedLatencyMs || 300}ms)`}
                            {step.type === 'delay' && `Pause for ${step.config.delayDurationMs || 400}ms`}
                            {step.type === 'input' && `Default: ${step.config.defaultPayload ? step.config.defaultPayload.slice(0, 45) + '...' : 'Raw payload'}`}
                            {step.type === 'output' && `Destination: ${step.config.destination || 'console'}`}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => moveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-nexus-text-dim hover:text-nexus-text disabled:opacity-20 rounded hover:bg-nexus-surface transition-colors"
                          title="Move step up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveStep(idx, 'down')}
                          disabled={idx === steps.length - 1}
                          className="p-1.5 text-nexus-text-dim hover:text-nexus-text disabled:opacity-20 rounded hover:bg-nexus-surface transition-colors"
                          title="Move step down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingStep(step)}
                          className="p-1.5 text-nexus-text-dim hover:text-indigo-400 rounded hover:bg-nexus-surface transition-colors"
                          title="Edit step configuration"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="p-1.5 text-nexus-text-dim hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                          title="Delete step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Execution History & Workflow Info */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-nexus-text">Pipeline Metrics</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
                <span className="text-[10px] text-nexus-text-dim block">Executions</span>
                <span className="text-sm font-bold text-nexus-text font-mono">{workflow.executionCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
                <span className="text-[10px] text-nexus-text-dim block">Success Rate</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{workflow.successRate}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
                <span className="text-[10px] text-nexus-text-dim block">Average Latency</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{workflow.avgDurationMs}ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
                <span className="text-[10px] text-nexus-text-dim block">Total Steps</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">{steps.length}</span>
              </div>
            </div>
          </div>

          {/* Execution History */}
          <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-nexus-text flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Execution History
              </h3>
              <span className="text-[10px] font-mono text-nexus-text-dim">{pastExecutions.length} runs</span>
            </div>

            {pastExecutions.length === 0 ? (
              <p className="text-xs text-nexus-text-muted">No runs recorded yet. Click "Test & Run Pipeline" to execute.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {pastExecutions.map(exec => (
                  <div
                    key={exec.id}
                    onClick={() => {
                      setActiveExecution(exec);
                      setExecutionLogs(exec.logs);
                      setShowRunModal(true);
                    }}
                    className="p-3 rounded-xl bg-nexus-base border border-nexus-border hover:border-nexus-border-bright cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-nexus-text font-semibold">{exec.id.slice(0, 14)}...</span>
                      <Badge
                        size="sm"
                        variant={exec.status === 'success' ? 'emerald' : exec.status === 'cancelled' ? 'amber' : 'rose'}
                      >
                        {exec.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-nexus-text-dim mt-2">
                      <span>{exec.durationMs}ms · {exec.logs.length} steps</span>
                      <span>{exec.startedAt.split('T')[1].slice(0, 8)} UTC</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step Config Editor Modal */}
      {editingStep && (
        <Modal
          isOpen={true}
          onClose={() => setEditingStep(null)}
          title={`Configure ${editingStep.title}`}
          description={`Step ${editingStep.order} · ${editingStep.type.toUpperCase()}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-nexus-text mb-1">Step Title</label>
              <input
                type="text"
                value={editingStep.title}
                onChange={e => setEditingStep({ ...editingStep, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nexus-text mb-1">Description</label>
              <input
                type="text"
                value={editingStep.description}
                onChange={e => setEditingStep({ ...editingStep, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
              />
            </div>

            {/* Type Specific Fields */}
            {editingStep.type === 'input' && (
              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Default Payload (JSON or String)</label>
                <textarea
                  rows={4}
                  value={editingStep.config.defaultPayload || ''}
                  onChange={e => setEditingStep({
                    ...editingStep,
                    config: { ...editingStep.config, defaultPayload: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border font-mono text-xs text-nexus-text focus:outline-none"
                />
              </div>
            )}

            {editingStep.type === 'transform' && (
              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Transform Operation</label>
                <select
                  value={editingStep.config.transformOperation || 'ai_summarize'}
                  onChange={e => setEditingStep({
                    ...editingStep,
                    config: { ...editingStep.config, transformOperation: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                >
                  <option value="ai_summarize">Deterministic AI Summarizer (Sentiment & Key Points)</option>
                  <option value="uppercase">Uppercase Text</option>
                  <option value="lowercase">Lowercase Text</option>
                  <option value="json_parse">Parse JSON String to Object</option>
                  <option value="json_stringify">Stringify Object to JSON</option>
                  <option value="regex_extract">Regex Pattern Extraction</option>
                </select>

                {editingStep.config.transformOperation === 'regex_extract' && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-nexus-text mb-1">Regex Pattern</label>
                    <input
                      type="text"
                      value={editingStep.config.regexPattern || ''}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, regexPattern: e.target.value }
                      })}
                      placeholder="e.g. \\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b"
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border font-mono text-xs text-nexus-text focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {editingStep.type === 'condition' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-nexus-text mb-1">Field Name</label>
                    <input
                      type="text"
                      value={editingStep.config.conditionField || ''}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, conditionField: e.target.value }
                      })}
                      placeholder="e.g. status or sentiment"
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nexus-text mb-1">Operator</label>
                    <select
                      value={editingStep.config.conditionOperator || 'is_truthy'}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, conditionOperator: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                    >
                      <option value="is_truthy">Is Truthy</option>
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nexus-text mb-1">Expected Value</label>
                    <input
                      type="text"
                      value={editingStep.config.conditionValue || ''}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, conditionValue: e.target.value }
                      })}
                      placeholder="e.g. true or ok"
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {editingStep.type === 'mock_api' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-nexus-text mb-1">HTTP Method</label>
                    <select
                      value={editingStep.config.apiMethod || 'POST'}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, apiMethod: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-nexus-text mb-1">API Endpoint</label>
                    <input
                      type="text"
                      value={editingStep.config.apiEndpoint || ''}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, apiEndpoint: e.target.value }
                      })}
                      placeholder="/api/v1/vectors/upsert"
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border font-mono text-xs text-nexus-text focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-nexus-text mb-1">Simulated Latency (ms)</label>
                    <input
                      type="number"
                      value={editingStep.config.simulatedLatencyMs ?? 300}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, simulatedLatencyMs: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nexus-text mb-1">Simulated Status Code</label>
                    <input
                      type="number"
                      value={editingStep.config.simulatedStatus ?? 200}
                      onChange={e => setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, simulatedStatus: Number(e.target.value) }
                      })}
                      placeholder="200 for OK, 400/500 to test failure"
                      className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {editingStep.type === 'delay' && (
              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Delay Duration (milliseconds)</label>
                <input
                  type="number"
                  value={editingStep.config.delayDurationMs ?? 400}
                  onChange={e => setEditingStep({
                    ...editingStep,
                    config: { ...editingStep.config, delayDurationMs: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                />
              </div>
            )}

            {editingStep.type === 'output' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-nexus-text mb-1">Destination</label>
                  <select
                    value={editingStep.config.destination || 'console'}
                    onChange={e => setEditingStep({
                      ...editingStep,
                      config: { ...editingStep.config, destination: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
                  >
                    <option value="console">Audit Log Console</option>
                    <option value="slack_mock">Simulated Slack Channel</option>
                    <option value="webhook">Outbound Webhook Dispatch</option>
                    <option value="storage">Persistent Audit Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nexus-text mb-1">Output Template (use {"{{data}}"}&#41;</label>
                  <input
                    type="text"
                    value={editingStep.config.outputTemplate || ''}
                    onChange={e => setEditingStep({
                      ...editingStep,
                      config: { ...editingStep.config, outputTemplate: e.target.value }
                    })}
                    placeholder="Result: {{data}}"
                    className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border font-mono text-xs text-nexus-text focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-nexus-border mt-4">
              <Button size="sm" variant="outline" onClick={() => setEditingStep(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleUpdateStepConfig(editingStep)}>
                Save Step Configuration
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Execution Runner Modal / Drawer */}
      <Modal
        isOpen={showRunModal}
        onClose={() => {
          if (!isExecuting) setShowRunModal(false);
        }}
        title={`Live Pipeline Runner: ${workflow.name}`}
        description="Deterministic local execution with live step progression, telemetry, and payload inspection."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Custom Input Payload Option */}
          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1">
              Custom Input Payload (Optional JSON or String)
            </label>
            <textarea
              rows={2}
              value={testPayloadInput}
              onChange={e => setTestPayloadInput(e.target.value)}
              placeholder="Leave empty to use step 1 default payload..."
              disabled={isExecuting}
              className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border font-mono text-xs text-nexus-text focus:outline-none"
            />
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                isLoading={isExecuting}
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={handleStartExecution}
                disabled={isExecuting}
              >
                {isExecuting ? 'Running Pipeline...' : 'Start Execution'}
              </Button>

              {isExecuting && (
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<Square className="w-3.5 h-3.5" />}
                  onClick={handleAbortExecution}
                >
                  Abort
                </Button>
              )}
            </div>

            {activeExecution && (
              <Badge
                variant={
                  activeExecution.status === 'success'
                    ? 'emerald'
                    : activeExecution.status === 'cancelled'
                    ? 'amber'
                    : 'rose'
                }
              >
                {activeExecution.status.toUpperCase()} ({activeExecution.durationMs}ms)
              </Badge>
            )}
          </div>

          {/* Live Terminal / Execution Log Window */}
          <div className="bg-black/90 rounded-xl p-4 border border-nexus-border font-mono text-xs text-emerald-400 max-h-80 overflow-y-auto space-y-2 select-text shadow-inner">
            <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>NEXUS Local Deterministic Execution Terminal</span>
              <span>PID: {Math.floor(Math.random() * 9000 + 1000)}</span>
            </div>

            {executionLogs.length === 0 && !isExecuting && (
              <p className="text-slate-500 py-6 text-center">
                Ready to execute. Click "Start Execution" above.
              </p>
            )}

            {executionLogs.map((log, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">[{log.timestamp.split('T')[1].slice(0, 8)}]</span>
                  <span className="text-indigo-400 font-bold">Step {idx + 1}:</span>
                  <span className="text-white">{log.stepTitle}</span>
                  <span className="text-slate-400">({log.durationMs}ms)</span>
                  <span className={log.status === 'success' ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    [{log.status.toUpperCase()}]
                  </span>
                </div>

                {log.error ? (
                  <div className="text-rose-400 pl-4 py-1 bg-rose-950/40 rounded border border-rose-900/40">
                    FATAL ERROR: {log.error}
                  </div>
                ) : (
                  <div className="text-slate-400 pl-4 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    ↳ Output: {typeof log.outputData === 'object' ? JSON.stringify(log.outputData, null, 2) : String(log.outputData)}
                  </div>
                )}
              </div>
            ))}

            {isExecuting && (
              <div className="flex items-center gap-2 text-indigo-400 animate-pulse pt-2">
                <span>Executing next step in pipeline sequence...</span>
              </div>
            )}
          </div>

          {/* Final Output Preview if finished */}
          {activeExecution && activeExecution.status === 'success' && activeExecution.finalOutput && (
            <div className="p-3 rounded-xl bg-nexus-base border border-nexus-border text-xs">
              <span className="font-semibold text-nexus-text block mb-1">Final Pipeline Payload:</span>
              <pre className="font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-32">
                {JSON.stringify(activeExecution.finalOutput, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-nexus-border">
            <Button
              size="sm"
              variant="outline"
              disabled={isExecuting}
              onClick={() => setShowRunModal(false)}
            >
              Close Runner
            </Button>
          </div>
        </div>
      </Modal>

      {/* Webhook Event Simulator Modal */}
      <WebhookSimulatorModal
        isOpen={showWebhookSimulator}
        onClose={() => setShowWebhookSimulator(false)}
        targetWorkflowId={workflow.id}
      />
    </div>
  );
};
