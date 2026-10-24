import { Workflow, WorkflowStep, WorkflowExecution, StepExecutionLog, StepConfig } from '../types';

export interface ExecutionOptions {
  inputPayload?: any;
  signal?: AbortSignal;
  onStepProgress?: (stepLog: StepExecutionLog) => void;
}

/**
 * Deterministic Local AI Summarizer simulation
 */
function simulateAiSummarize(input: string): { summary: string; wordCount: number; keyPoints: string[]; sentiment: string } {
  const str = String(input || '');
  const words = str.trim().split(/\s+/).filter(Boolean);
  const sentences = str.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  
  const keyPoints = sentences.length > 0
    ? sentences.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1))
    : ['Input processed successfully by NEXUS deterministic summarizer.'];

  const sentiment = str.toLowerCase().includes('fail') || str.toLowerCase().includes('error') || str.toLowerCase().includes('issue')
    ? 'Concerned / Bug Analysis'
    : str.toLowerCase().includes('success') || str.toLowerCase().includes('great') || str.toLowerCase().includes('ship')
    ? 'Positive / Production Ready'
    : 'Neutral / Informational';

  return {
    summary: `[NEXUS AI Summary]: Evaluated ${words.length} words across ${sentences.length || 1} context blocks. Core topic: "${words.slice(0, 5).join(' ')}..."`,
    wordCount: words.length,
    keyPoints,
    sentiment,
  };
}

/**
 * Mock API simulation with deterministic latency and response
 */
async function executeMockApi(config: StepConfig, currentData: any, signal?: AbortSignal): Promise<any> {
  const latency = config.simulatedLatencyMs ?? 350;
  
  if (signal?.aborted) {
    throw new DOMException('Execution aborted by user', 'AbortError');
  }

  // Sleep for the simulated latency
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, latency);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Execution aborted by user', 'AbortError'));
      });
    }
  });

  const statusCode = config.simulatedStatus ?? 200;
  const endpoint = config.apiEndpoint || '/api/v1/process';
  const method = config.apiMethod || 'POST';

  if (statusCode >= 400) {
    throw new Error(`Mock API Error (${statusCode} on ${method} ${endpoint}): Simulated external service rejection.`);
  }

  // If user provided a custom mock JSON response body
  if (config.mockResponseBody) {
    try {
      return JSON.parse(config.mockResponseBody);
    } catch {
      return { raw: config.mockResponseBody };
    }
  }

  // Deterministic mock payload based on endpoint
  return {
    _simulation: {
      isSimulated: true,
      service: 'NEXUS Local Mock Gateway',
      note: 'Simulated local execution - zero external API dependencies required',
      statusCode,
      endpoint,
      method,
      roundtripLatencyMs: latency,
    },
    data: currentData,
    meta: {
      processedAt: new Date().toISOString(),
      requestId: `sim_${Math.random().toString(36).substring(2, 9)}`,
      status: 'VERIFIED_OK',
    }
  };
}

/**
 * Execute a single workflow step deterministically
 */
export async function executeStep(
  step: WorkflowStep,
  inputData: any,
  signal?: AbortSignal
): Promise<{ outputData: any; error?: string }> {
  const { type, config } = step;

  if (signal?.aborted) {
    throw new DOMException('Execution aborted by user', 'AbortError');
  }

  switch (type) {
    case 'input': {
      // Validate or return payload
      if (inputData !== undefined && inputData !== null && inputData !== '') {
        return { outputData: inputData };
      }
      if (config.defaultPayload) {
        try {
          return { outputData: JSON.parse(config.defaultPayload) };
        } catch {
          return { outputData: config.defaultPayload };
        }
      }
      return { outputData: { message: 'Default initial NEXUS payload', timestamp: Date.now() } };
    }

    case 'transform': {
      const op = config.transformOperation || 'uppercase';
      const text = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);

      if (op === 'uppercase') {
        return { outputData: text.toUpperCase() };
      } else if (op === 'lowercase') {
        return { outputData: text.toLowerCase() };
      } else if (op === 'json_parse') {
        try {
          return { outputData: typeof inputData === 'string' ? JSON.parse(inputData) : inputData };
        } catch (e: any) {
          throw new Error(`JSON Parse Error: ${e.message}`);
        }
      } else if (op === 'json_stringify') {
        return { outputData: JSON.stringify(inputData, null, 2) };
      } else if (op === 'regex_extract') {
        const pattern = config.regexPattern || '\\w+';
        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex) || [];
        return { outputData: { pattern, matches, totalMatches: matches.length } };
      } else if (op === 'ai_summarize') {
        return { outputData: simulateAiSummarize(text) };
      }
      return { outputData: text };
    }

    case 'condition': {
      const field = config.conditionField;
      const op = config.conditionOperator || 'is_truthy';
      const targetVal = config.conditionValue || '';

      let testValue: any = inputData;
      if (field && typeof inputData === 'object' && inputData !== null) {
        testValue = (inputData as any)[field];
      }

      let conditionMet = false;
      if (op === 'equals') {
        conditionMet = String(testValue).trim().toLowerCase() === String(targetVal).trim().toLowerCase();
      } else if (op === 'contains') {
        conditionMet = String(testValue).toLowerCase().includes(String(targetVal).toLowerCase());
      } else if (op === 'greater_than') {
        conditionMet = Number(testValue) > Number(targetVal);
      } else if (op === 'less_than') {
        conditionMet = Number(testValue) < Number(targetVal);
      } else if (op === 'is_truthy') {
        conditionMet = Boolean(testValue && testValue !== 'false' && testValue !== '0');
      }

      return {
        outputData: {
          conditionMet,
          evaluatedField: field || 'root',
          actualValue: testValue,
          expectedValue: targetVal,
          operator: op,
          payload: inputData,
        }
      };
    }

    case 'delay': {
      const delayMs = config.delayDurationMs || 400;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, delayMs);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Execution aborted by user', 'AbortError'));
          });
        }
      });
      return { outputData: { ...((typeof inputData === 'object' && inputData !== null) ? inputData : { value: inputData }), _delayedMs: delayMs } };
    }

    case 'mock_api': {
      const result = await executeMockApi(config, inputData, signal);
      return { outputData: result };
    }

    case 'output': {
      const destination = config.destination || 'console';
      const template = config.outputTemplate || 'Execution completed with result: {{data}}';
      const rendered = template.replace('{{data}}', typeof inputData === 'object' ? JSON.stringify(inputData) : String(inputData));

      return {
        outputData: {
          destination,
          formattedResult: rendered,
          delivered: true,
          deliveredAt: new Date().toISOString(),
          finalPayload: inputData,
        }
      };
    }

    default:
      return { outputData: inputData };
  }
}

/**
 * Main Deterministic Workflow Execution Runner
 */
export async function runWorkflow(
  workflow: Workflow,
  options: ExecutionOptions = {}
): Promise<WorkflowExecution> {
  const { inputPayload, signal, onStepProgress } = options;
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startedAt = new Date().toISOString();
  const startTime = performance.now();

  const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);
  const logs: StepExecutionLog[] = [];

  let currentData = inputPayload !== undefined ? inputPayload : (sortedSteps[0]?.config.defaultPayload || 'Sample Input Message');
  let failedStepId: string | undefined;
  let errorMessage: string | undefined;
  let finalStatus: WorkflowExecution['status'] = 'running';

  for (let i = 0; i < sortedSteps.length; i++) {
    const step = sortedSteps[i];

    if (signal?.aborted) {
      finalStatus = 'cancelled';
      errorMessage = 'Execution was cancelled by the user';
      break;
    }

    const stepStartTime = performance.now();
    try {
      const stepInput = currentData;
      const result = await executeStep(step, currentData, signal);
      const stepDuration = Math.round(performance.now() - stepStartTime);

      currentData = result.outputData;

      const log: StepExecutionLog = {
        stepId: step.id,
        stepTitle: step.title,
        stepType: step.type,
        status: 'success',
        inputData: stepInput,
        outputData: result.outputData,
        durationMs: stepDuration,
        timestamp: new Date().toISOString(),
      };

      logs.push(log);
      onStepProgress?.(log);

      // Handle branch condition skipping if condition is false
      if (step.type === 'condition' && !result.outputData.conditionMet) {
        // In linear chain, if condition is false, note it in log
        log.outputData._branchRoute = 'FALSE_BRANCH_TAKEN';
      }
    } catch (err: any) {
      const stepDuration = Math.round(performance.now() - stepStartTime);
      const isAbort = err.name === 'AbortError' || signal?.aborted;
      
      const errorText = isAbort ? 'Execution cancelled' : (err.message || 'Unknown step execution failure');
      failedStepId = step.id;
      errorMessage = errorText;
      finalStatus = isAbort ? 'cancelled' : 'failed';

      const log: StepExecutionLog = {
        stepId: step.id,
        stepTitle: step.title,
        stepType: step.type,
        status: 'failed',
        inputData: currentData,
        outputData: null,
        durationMs: stepDuration,
        timestamp: new Date().toISOString(),
        error: errorText,
      };

      logs.push(log);
      onStepProgress?.(log);
      break;
    }
  }

  if (finalStatus === 'running') {
    finalStatus = 'success';
  }

  const durationMs = Math.round(performance.now() - startTime);
  const finishedAt = new Date().toISOString();

  return {
    id: executionId,
    workflowId: workflow.id,
    workflowName: workflow.name,
    trigger: workflow.trigger,
    status: finalStatus,
    startedAt,
    finishedAt,
    durationMs,
    inputPayload,
    finalOutput: finalStatus === 'success' ? currentData : undefined,
    logs,
    failedStepId,
    errorMessage,
  };
}
