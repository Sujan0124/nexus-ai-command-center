import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { WorkflowTrigger, WorkflowStep } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface WorkflowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowFormModal: React.FC<WorkflowFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { createWorkflow, projects } = useAppData();
  const { user } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<WorkflowTrigger>('webhook');
  const [projectId, setProjectId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('Automation, AI');
  const [template, setTemplate] = useState<'empty' | 'security_gate' | 'summarizer'>('security_gate');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Workflow name is required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getStarterSteps = (): WorkflowStep[] => {
    if (template === 'empty') {
      return [
        {
          id: `step_${Date.now()}_1`,
          title: 'Trigger Input',
          description: 'Accepts raw payload data',
          type: 'input',
          order: 1,
          config: { defaultPayload: '{"status": "ok"}' },
        },
        {
          id: `step_${Date.now()}_2`,
          title: 'Output Result',
          description: 'Formats and emits output',
          type: 'output',
          order: 2,
          config: { destination: 'console', outputTemplate: 'Result: {{data}}' },
        }
      ];
    } else if (template === 'summarizer') {
      return [
        {
          id: `step_${Date.now()}_1`,
          title: 'Ingest Input Text',
          description: 'Receives document text or logs',
          type: 'input',
          order: 1,
          config: { defaultPayload: 'NEXUS deployment completed successfully across 4 edge clusters with zero error rates.' },
        },
        {
          id: `step_${Date.now()}_2`,
          title: 'Deterministic AI Summarizer',
          description: 'Evaluates sentiment and produces bullet points',
          type: 'transform',
          order: 2,
          config: { transformOperation: 'ai_summarize' },
        },
        {
          id: `step_${Date.now()}_3`,
          title: 'Dispatch Slack Alert',
          description: 'Posts output to communications queue',
          type: 'output',
          order: 3,
          config: { destination: 'slack_mock', outputTemplate: 'AI Summary Report: {{data}}' },
        }
      ];
    }

    // Default: Security gate
    return [
      {
        id: `step_${Date.now()}_1`,
        title: 'Receive GitHub Webhook',
        description: 'Webhook diff payload for incoming pull request',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: JSON.stringify({ pr: 104, author: 'dev.lead', changedFiles: 4, diffText: 'Refactor auth guard and remove deprecated TLS 1.0 ciphers.' }, null, 2)
        },
      },
      {
        id: `step_${Date.now()}_2`,
        title: 'Normalize Code Diff',
        description: 'Converts payload to lowercase token stream',
        type: 'transform',
        order: 2,
        config: { transformOperation: 'lowercase' },
      },
      {
        id: `step_${Date.now()}_3`,
        title: 'Mock Security Audit API',
        description: 'Simulates AST static code analysis check',
        type: 'mock_api',
        order: 3,
        config: {
          apiEndpoint: '/api/v1/security/ast-check',
          apiMethod: 'POST',
          simulatedLatencyMs: 300,
          simulatedStatus: 200,
        },
      },
      {
        id: `step_${Date.now()}_4`,
        title: 'Broadcast Audit Result',
        description: 'Dispatches finalized result payload to console',
        type: 'output',
        order: 4,
        config: { destination: 'console', outputTemplate: 'Security Gate Passed: {{data}}' },
      }
    ];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const steps = getStarterSteps();

    const created = createWorkflow({
      name: name.trim(),
      description: description.trim(),
      trigger,
      status: 'active',
      owner: user?.name || 'Elena Rostova',
      projectId: projectId || undefined,
      tags,
      steps,
    });

    success('Workflow created successfully.');
    onClose();
    navigate(`/workflows/${created.id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New AI Workflow"
      description="Design a resilient, deterministic multi-step automated execution pipeline."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1.5">
            Workflow Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Automated Sentry Issue Triage & Rollback"
            className={`w-full px-3.5 py-2 rounded-xl bg-nexus-base border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              errors.name ? 'border-rose-500' : 'border-nexus-border'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1.5">
            Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What does this pipeline automate? e.g. Triggered by webhook, analyzes AST, and deploys patch."
            className={`w-full px-3.5 py-2 rounded-xl bg-nexus-base border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              errors.description ? 'border-rose-500' : 'border-nexus-border'
            }`}
          />
          {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1.5">Trigger Type</label>
            <select
              value={trigger}
              onChange={e => setTrigger(e.target.value as WorkflowTrigger)}
              className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="webhook">Webhook (HTTP POST)</option>
              <option value="scheduled">Scheduled (Cron / Interval)</option>
              <option value="event">System Event Stream</option>
              <option value="manual">Manual Trigger Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1.5">Associated Project</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">None (Independent Workflow)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1.5">Starter Template</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'security_gate', title: 'Security Gate', desc: 'Input → Transform → Mock API → Output' },
              { id: 'summarizer', title: 'AI Summarizer', desc: 'Input → AI Summarize → Output' },
              { id: 'empty', title: 'Blank Pipeline', desc: 'Input → Output skeleton' },
            ].map(tpl => (
              <div
                key={tpl.id}
                onClick={() => setTemplate(tpl.id as any)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  template === tpl.id
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-nexus-text'
                    : 'bg-nexus-base border-nexus-border text-nexus-text-muted hover:border-nexus-border-bright'
                }`}
              >
                <p className="text-xs font-semibold">{tpl.title}</p>
                <p className="text-[10px] text-nexus-text-dim mt-0.5">{tpl.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1.5">Tags (comma separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="Security, CI/CD, AI/ML"
            className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-nexus-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Create & Open Editor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
