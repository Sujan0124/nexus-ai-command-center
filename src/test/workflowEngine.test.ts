import { describe, it, expect } from 'vitest';
import { executeStep, runWorkflow } from '../engine/workflowEngine';
import { Workflow, WorkflowStep } from '../types';

describe('Workflow Execution Engine', () => {
  it('executes input step with provided or default payload', async () => {
    const step: WorkflowStep = {
      id: 'step_in_1',
      title: 'Input Step',
      description: 'Test input',
      type: 'input',
      order: 1,
      config: { defaultPayload: '{"hello": "world"}' },
    };

    const res = await executeStep(step, 'custom input');
    expect(res.outputData).toBe('custom input');

    const defaultRes = await executeStep(step, undefined);
    expect(defaultRes.outputData).toEqual({ hello: 'world' });
  });

  it('transforms text to uppercase and lowercase correctly', async () => {
    const stepUpper: WorkflowStep = {
      id: 'step_tr_1',
      title: 'Uppercase',
      description: 'Transform',
      type: 'transform',
      order: 2,
      config: { transformOperation: 'uppercase' },
    };

    const resUpper = await executeStep(stepUpper, 'nexus command center');
    expect(resUpper.outputData).toBe('NEXUS COMMAND CENTER');

    const stepLower: WorkflowStep = {
      id: 'step_tr_2',
      title: 'Lowercase',
      description: 'Transform',
      type: 'transform',
      order: 2,
      config: { transformOperation: 'lowercase' },
    };

    const resLower = await executeStep(stepLower, 'NEXUS COMMAND');
    expect(resLower.outputData).toBe('nexus command');
  });

  it('runs deterministic AI summarization with sentiment analysis', async () => {
    const stepAi: WorkflowStep = {
      id: 'step_ai_1',
      title: 'AI Summarizer',
      description: 'Summarizes text',
      type: 'transform',
      order: 2,
      config: { transformOperation: 'ai_summarize' },
    };

    const input = 'Fatal error in Kubernetes replica node. Cluster pod failed to boot due to memory limit.';
    const res = await executeStep(stepAi, input);

    expect(res.outputData).toHaveProperty('summary');
    expect(res.outputData).toHaveProperty('keyPoints');
    expect(res.outputData.sentiment).toContain('Bug Analysis');
  });

  it('evaluates conditional branching conditions accurately', async () => {
    const stepCond: WorkflowStep = {
      id: 'step_cond_1',
      title: 'Condition',
      description: 'Check status',
      type: 'condition',
      order: 3,
      config: {
        conditionField: 'status',
        conditionOperator: 'equals',
        conditionValue: 'ok',
      },
    };

    const passRes = await executeStep(stepCond, { status: 'ok', count: 5 });
    expect(passRes.outputData.conditionMet).toBe(true);

    const failRes = await executeStep(stepCond, { status: 'failed', count: 5 });
    expect(failRes.outputData.conditionMet).toBe(false);

    // Number comparison
    const stepGt: WorkflowStep = {
      id: 'step_cond_gt',
      title: 'Greater Than',
      description: 'Check latency',
      type: 'condition',
      order: 3,
      config: {
        conditionField: 'latency',
        conditionOperator: 'greater_than',
        conditionValue: '200',
      },
    };

    const gtRes = await executeStep(stepGt, { latency: 350 });
    expect(gtRes.outputData.conditionMet).toBe(true);
  });

  it('executes multi-step workflow end-to-end and reports output', async () => {
    const testWorkflow: Workflow = {
      id: 'wf_test_1',
      name: 'Integration Test Pipeline',
      description: 'End-to-end integration test',
      trigger: 'manual',
      status: 'active',
      owner: 'Elena Rostova',
      executionCount: 0,
      successRate: 100,
      avgDurationMs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Test'],
      steps: [
        {
          id: 'step_1',
          title: 'Input',
          description: 'Input message',
          type: 'input',
          order: 1,
          config: { defaultPayload: 'sample message' },
        },
        {
          id: 'step_2',
          title: 'Uppercase Transform',
          description: 'Transform to uppercase',
          type: 'transform',
          order: 2,
          config: { transformOperation: 'uppercase' },
        },
        {
          id: 'step_3',
          title: 'Output Step',
          description: 'Delivers result',
          type: 'output',
          order: 3,
          config: { destination: 'console', outputTemplate: 'Result: {{data}}' },
        },
      ],
    };

    const execution = await runWorkflow(testWorkflow);
    expect(execution.status).toBe('success');
    expect(execution.logs.length).toBe(3);
    expect(execution.finalOutput.formattedResult).toBe('Result: SAMPLE MESSAGE');
  });

  it('handles simulated mock API failure safely without crashing', async () => {
    const failingWorkflow: Workflow = {
      id: 'wf_fail_test',
      name: 'Failure Test Pipeline',
      description: 'Simulates API 500 error',
      trigger: 'manual',
      status: 'active',
      owner: 'Elena Rostova',
      executionCount: 0,
      successRate: 100,
      avgDurationMs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Test'],
      steps: [
        {
          id: 'step_1',
          title: 'Input',
          description: 'Input',
          type: 'input',
          order: 1,
          config: { defaultPayload: 'test' },
        },
        {
          id: 'step_fail',
          title: 'Failing Mock API',
          description: 'Throws 500 error',
          type: 'mock_api',
          order: 2,
          config: {
            apiEndpoint: '/api/v1/error',
            simulatedStatus: 500,
            simulatedLatencyMs: 50,
          },
        },
        {
          id: 'step_never',
          title: 'Unreached Step',
          description: 'Should not execute',
          type: 'output',
          order: 3,
          config: {},
        },
      ],
    };

    const execution = await runWorkflow(failingWorkflow);
    expect(execution.status).toBe('failed');
    expect(execution.failedStepId).toBe('step_fail');
    expect(execution.errorMessage).toContain('500');
    expect(execution.logs.length).toBe(2);
  });

  it('supports user cancellation via AbortSignal', async () => {
    const abortWorkflow: Workflow = {
      id: 'wf_abort_test',
      name: 'Abort Pipeline',
      description: 'Tests cancellation',
      trigger: 'manual',
      status: 'active',
      owner: 'Elena Rostova',
      executionCount: 0,
      successRate: 100,
      avgDurationMs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Test'],
      steps: [
        {
          id: 'step_delay',
          title: 'Long Delay',
          description: 'Delay step',
          type: 'delay',
          order: 1,
          config: { delayDurationMs: 800 },
        },
      ],
    };

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100);

    const execution = await runWorkflow(abortWorkflow, { signal: controller.signal });
    expect(execution.status).toBe('cancelled');
  });
});
