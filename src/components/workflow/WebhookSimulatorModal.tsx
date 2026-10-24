import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Terminal, 
  ShieldCheck, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Copy,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Workflow, WorkflowExecution } from '../../types';
import { runWorkflow } from '../../engine/workflowEngine';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWorkflowId?: string;
}

export const WebhookSimulatorModal: React.FC<WebhookSimulatorModalProps> = ({
  isOpen,
  onClose,
  targetWorkflowId,
}) => {
  const { workflows, recordExecution } = useAppData();
  const { success, error: toastError } = useToast();

  const webhookWorkflows = workflows.filter(w => w.trigger === 'webhook' || w.trigger === 'event');

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(() => {
    return targetWorkflowId || webhookWorkflows[0]?.id || workflows[0]?.id || '';
  });

  const [presetType, setPresetType] = useState<'github_pr' | 'cve_alert' | 'support_ticket' | 'custom'>('github_pr');
  const [payloadText, setPayloadText] = useState<string>(() => {
    return JSON.stringify({
      event: 'pull_request.opened',
      repository: 'nexus/backend-core',
      pullRequestId: 512,
      author: 'dev.lead',
      changedFiles: 6,
      diffSummary: 'feat: add streaming token support and sanitize incoming AST headers',
      action: 'opened',
    }, null, 2);
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecution | null>(null);

  const handlePresetChange = (type: typeof presetType) => {
    setPresetType(type);
    if (type === 'github_pr') {
      setPayloadText(JSON.stringify({
        event: 'pull_request.opened',
        repository: 'nexus/backend-core',
        pullRequestId: 512,
        author: 'dev.lead',
        changedFiles: 6,
        diffSummary: 'feat: add streaming token support and sanitize incoming AST headers',
        action: 'opened',
      }, null, 2));
    } else if (type === 'cve_alert') {
      setPayloadText(JSON.stringify({
        event: 'security.advisory_published',
        cve: 'CVE-2026-9042',
        package: 'json-schema-validator',
        currentVersion: '2.4.1',
        fixedVersion: '2.4.2',
        severity: 'HIGH',
        vulnerability: 'Prototype pollution in recursive key traversal',
      }, null, 2));
    } else if (type === 'support_ticket') {
      setPayloadText(JSON.stringify({
        event: 'ticket.created',
        ticketId: 'TCK-88192',
        accountTier: 'Enterprise AI Dedicated',
        sender: 'cto@acme-global.com',
        subject: 'URGENT: Intermittent 503 errors on EU inference endpoint',
        body: 'We are experiencing severe timeouts in our production cluster. Please escalate immediately!',
      }, null, 2));
    } else {
      setPayloadText('{\n  "customField": "value",\n  "status": "active"\n}');
    }
  };

  const handleDispatch = async () => {
    const targetWf = workflows.find(w => w.id === selectedWorkflowId);
    if (!targetWf) {
      toastError('Error', 'Please select a valid pipeline target.');
      return;
    }

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (e: any) {
      toastError('Invalid JSON Payload', e.message);
      return;
    }

    setIsSimulating(true);
    setExecutionResult(null);

    try {
      const result = await runWorkflow(targetWf, {
        inputPayload: parsedPayload,
      });

      setExecutionResult(result);
      recordExecution(result);

      if (result.status === 'success') {
        success('Webhook Trigger Acknowledged', `Executed ${result.logs.length} steps in ${result.durationMs}ms with status HTTP 200 OK.`);
      } else {
        toastError('Pipeline Execution Error', result.errorMessage || 'Execution encountered an error.');
      }
    } catch (err: any) {
      toastError('Dispatch Error', err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const selectedWf = workflows.find(w => w.id === selectedWorkflowId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mock Webhook Event Simulator"
      description="Simulate external HTTP POST webhook transmissions (GitHub, Zendesk, Sentry, Stripe) directly into your workflow pipelines."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Target Workflow Selection */}
        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1">
            Target Pipeline Listener
          </label>
          <select
            value={selectedWorkflowId}
            onChange={e => setSelectedWorkflowId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
          >
            {webhookWorkflows.map(wf => (
              <option key={wf.id} value={wf.id}>
                {wf.name} ({wf.trigger} trigger · {wf.steps.length} steps)
              </option>
            ))}
          </select>
        </div>

        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1">
            Event Payload Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'github_pr', label: 'GitHub PR' },
              { id: 'cve_alert', label: 'CVE Security' },
              { id: 'support_ticket', label: 'Support SLA' },
              { id: 'custom', label: 'Custom JSON' },
            ].map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  presetType === preset.id
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-nexus-base text-nexus-text-dim hover:text-nexus-text border-nexus-border'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated HTTP Headers Snippet */}
        <div className="p-3 rounded-xl bg-nexus-base border border-nexus-border font-mono text-[11px] space-y-1">
          <div className="text-nexus-text-dim flex justify-between">
            <span>POST /api/v1/nexus/webhooks/{selectedWorkflowId}</span>
            <span className="text-emerald-400 font-bold">HTTP/1.1</span>
          </div>
          <div className="text-indigo-400">Content-Type: application/json</div>
          <div className="text-slate-500">X-Nexus-Signature: sha256=9b18f8e02d41a77e8c3</div>
          <div className="text-slate-500">X-Event-Delivery: {Date.now().toString(36)}</div>
        </div>

        {/* Payload Editor */}
        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1">
            HTTP POST JSON Request Body
          </label>
          <textarea
            rows={5}
            value={payloadText}
            onChange={e => setPayloadText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-nexus-base border border-nexus-border font-mono text-xs text-nexus-text focus:outline-none"
          />
        </div>

        {/* Dispatch Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-nexus-text-dim">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic local simulation · Zero external network traffic</span>
          </div>

          <Button
            size="sm"
            variant="primary"
            isLoading={isSimulating}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={handleDispatch}
          >
            {isSimulating ? 'Dispatching...' : 'Dispatch Webhook Event'}
          </Button>
        </div>

        {/* Execution Output Panel */}
        {executionResult && (
          <div className="mt-4 p-4 rounded-xl bg-black/90 border border-nexus-border font-mono text-xs text-emerald-400 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-slate-400 font-bold">Simulator Response</span>
              <Badge
                size="sm"
                variant={executionResult.status === 'success' ? 'emerald' : 'rose'}
              >
                {executionResult.status.toUpperCase()} ({executionResult.durationMs}ms)
              </Badge>
            </div>

            <div className="space-y-1 pt-1">
              {executionResult.logs.map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-500">[{log.timestamp.split('T')[1].slice(0, 8)}]</span>
                  <span className="text-indigo-400">Step {i + 1}:</span>
                  <span className="text-white">{log.stepTitle}</span>
                  <span className="text-emerald-400">✓ {log.durationMs}ms</span>
                </div>
              ))}
            </div>

            {executionResult.finalOutput && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-0.5">Final Delivered Payload:</span>
                <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-32">
                  {JSON.stringify(executionResult.finalOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
