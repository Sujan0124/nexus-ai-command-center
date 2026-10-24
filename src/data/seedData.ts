import { 
  Project, 
  Workflow, 
  Task, 
  ActivityEvent, 
  NotificationItem, 
  TeamMember, 
  AppSettings,
  WorkflowExecution 
} from '../types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user_1',
    name: 'Elena Rostova',
    email: 'elena.rostova@nexus-ai.internal',
    role: 'Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering & AI Architecture',
    joinedAt: '2025-01-15',
    lastActive: 'Just now',
    status: 'active',
  },
  {
    id: 'user_2',
    name: 'Marcus Vance',
    email: 'marcus.vance@nexus-ai.internal',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Platform Engineering',
    joinedAt: '2025-02-01',
    lastActive: '5 minutes ago',
    status: 'active',
  },
  {
    id: 'user_3',
    name: 'Sarah Chen',
    email: 'sarah.chen@nexus-ai.internal',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Product Management',
    joinedAt: '2025-02-18',
    lastActive: '12 minutes ago',
    status: 'active',
  },
  {
    id: 'user_4',
    name: 'Devon Wright',
    email: 'devon.wright@nexus-ai.internal',
    role: 'Member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Quality Engineering & CI/CD',
    joinedAt: '2025-03-05',
    lastActive: '1 hour ago',
    status: 'active',
  },
  {
    id: 'user_5',
    name: 'Amina Al-Mansoor',
    email: 'amina.almansoor@nexus-ai.internal',
    role: 'Member',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Machine Learning Infrastructure',
    joinedAt: '2025-04-12',
    lastActive: '2 hours ago',
    status: 'active',
  },
  {
    id: 'user_6',
    name: 'Liam Gallagher',
    email: 'liam.gallagher@nexus-ai.internal',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    department: 'Developer Operations',
    joinedAt: '2025-06-01',
    lastActive: 'Yesterday',
    status: 'offline',
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Autonomous Code Review Agent',
    description: 'Self-hosted LLM pipeline that analyzes pull requests, flags vulnerabilities, and recommends clean architecture patterns.',
    status: 'Active',
    priority: 'critical',
    owner: 'Elena Rostova',
    tags: ['AI/ML', 'DevSecOps', 'GitHub', 'Core'],
    progress: 78,
    dueDate: '2026-11-15',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-10-23T14:30:00Z',
    relatedWorkflowIds: ['wf_1', 'wf_2', 'wf_7'],
  },
  {
    id: 'proj_2',
    name: 'Distributed Vector Memory Indexer',
    description: 'High-throughput semantic embedding ingestion system connecting Elasticsearch with Qdrant clusters.',
    status: 'Active',
    priority: 'high',
    owner: 'Marcus Vance',
    tags: ['VectorDB', 'Embeddings', 'Qdrant', 'Search'],
    progress: 92,
    dueDate: '2026-10-31',
    createdAt: '2026-08-15T11:20:00Z',
    updatedAt: '2026-10-24T08:15:00Z',
    relatedWorkflowIds: ['wf_3', 'wf_8'],
  },
  {
    id: 'proj_3',
    name: 'SOC2 Type II Automated Compliance Audit',
    description: 'Automated continuous evaluation of IAM policies, Kubernetes node hardening, and encrypted secret access logging.',
    status: 'Planning',
    priority: 'high',
    owner: 'Sarah Chen',
    tags: ['Security', 'Compliance', 'Audit', 'Infra'],
    progress: 25,
    dueDate: '2026-12-20',
    createdAt: '2026-09-10T16:00:00Z',
    updatedAt: '2026-10-22T10:45:00Z',
    relatedWorkflowIds: ['wf_4', 'wf_9'],
  },
  {
    id: 'proj_4',
    name: 'Multi-Tenant Edge Gateway v3',
    description: 'Low-latency reverse proxy and rate-limiting sidecar written in Rust for global AI inference routing.',
    status: 'Active',
    priority: 'medium',
    owner: 'Marcus Vance',
    tags: ['Rust', 'Networking', 'Edge', 'Latency'],
    progress: 60,
    dueDate: '2026-11-30',
    createdAt: '2026-08-20T13:10:00Z',
    updatedAt: '2026-10-24T06:20:00Z',
    relatedWorkflowIds: ['wf_5'],
  },
  {
    id: 'proj_5',
    name: 'Real-time Synthetic User Simulation',
    description: 'Headless browser automation pool simulating 10,000 concurrent user sessions across staging environments.',
    status: 'Paused',
    priority: 'medium',
    owner: 'Devon Wright',
    tags: ['QA', 'Playwright', 'LoadTest', 'E2E'],
    progress: 45,
    dueDate: '2026-12-05',
    createdAt: '2026-09-01T08:45:00Z',
    updatedAt: '2026-10-18T17:00:00Z',
    relatedWorkflowIds: ['wf_6'],
  },
  {
    id: 'proj_6',
    name: 'LLM Fine-Tuning & Quantization Pipeline',
    description: 'Automated LoRA and 4-bit AWQ quantization pipelines running on internal H100 GPU clusters.',
    status: 'Completed',
    priority: 'high',
    owner: 'Amina Al-Mansoor',
    tags: ['PyTorch', 'Quantization', 'H100', 'MLOps'],
    progress: 100,
    dueDate: '2026-10-10',
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-10-12T15:20:00Z',
    relatedWorkflowIds: ['wf_10'],
  },
  {
    id: 'proj_7',
    name: 'Customer Support Telemetry Ingestion',
    description: 'Zendesk and Intercom sentiment categorization pipeline delivering real-time anomaly alerts to Slack.',
    status: 'Active',
    priority: 'low',
    owner: 'Sarah Chen',
    tags: ['Support', 'NLP', 'Slack', 'Analytics'],
    progress: 88,
    dueDate: '2026-11-01',
    createdAt: '2026-09-15T12:00:00Z',
    updatedAt: '2026-10-24T09:30:00Z',
    relatedWorkflowIds: ['wf_11'],
  },
  {
    id: 'proj_8',
    name: 'Legacy Monolith Database Deprecation',
    description: 'Zero-downtime migration of legacy PostgreSQL tables to distributed event-sourced Kafka architecture.',
    status: 'Archived',
    priority: 'low',
    owner: 'Marcus Vance',
    tags: ['Migration', 'Kafka', 'PostgreSQL', 'Legacy'],
    progress: 100,
    dueDate: '2026-08-30',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
    relatedWorkflowIds: ['wf_12'],
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    projectId: 'proj_1',
    title: 'Integrate AST parser with tree-sitter for TypeScript AST queries',
    description: 'Ensure accurate syntax tree generation for AST diffs before passing tokens to the AI context evaluator.',
    status: 'done',
    priority: 'high',
    assignee: 'Elena Rostova',
    dueDate: '2026-10-18',
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
  {
    id: 'task_2',
    projectId: 'proj_1',
    title: 'Implement OWASP Top 10 security rule verification prompt',
    description: 'Create zero-shot and few-shot detection templates for SQL injection, SSRF, and credential leaks.',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Elena Rostova',
    dueDate: '2026-10-27',
    createdAt: '2026-10-19T09:30:00Z',
    updatedAt: '2026-10-23T14:00:00Z',
  },
  {
    id: 'task_3',
    projectId: 'proj_1',
    title: 'Add webhook signature verification for GitHub app webhooks',
    description: 'Verify HMAC SHA256 header using timingSafeEqual to avoid timing side-channel attacks.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Devon Wright',
    dueDate: '2026-11-02',
    createdAt: '2026-10-21T11:15:00Z',
    updatedAt: '2026-10-21T11:15:00Z',
  },
  {
    id: 'task_4',
    projectId: 'proj_2',
    title: 'Benchmark Qdrant Cosine vs HNSW index quantization memory footprint',
    description: 'Measure latency degradation on 500k vectors using scalar quantization versus float32 raw vectors.',
    status: 'done',
    priority: 'high',
    assignee: 'Marcus Vance',
    dueDate: '2026-10-20',
    createdAt: '2026-10-14T14:00:00Z',
    updatedAt: '2026-10-20T17:30:00Z',
  },
  {
    id: 'task_5',
    projectId: 'proj_2',
    title: 'Configure automated snapshot backups to S3 Glacier storage',
    description: 'Automate daily midnight snapshots with encryption using KMS Customer Managed Keys.',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Marcus Vance',
    dueDate: '2026-10-29',
    createdAt: '2026-10-21T13:45:00Z',
    updatedAt: '2026-10-23T11:20:00Z',
  },
  {
    id: 'task_6',
    projectId: 'proj_3',
    title: 'Draft SOC2 Trust Services Criteria mapping document',
    description: 'Cross-reference CC6.1, CC6.6, and CC7.1 with existing automated terraform guardrails.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Sarah Chen',
    dueDate: '2026-11-10',
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-22T16:00:00Z',
  },
  {
    id: 'task_7',
    projectId: 'proj_4',
    title: 'Write criterion benchmarks for Rust Tokio connection pool reuse',
    description: 'Stress test 100k persistent TLS connections to ensure zero socket starvation during peak spike.',
    status: 'review',
    priority: 'high',
    assignee: 'Devon Wright',
    dueDate: '2026-10-26',
    createdAt: '2026-10-16T15:00:00Z',
    updatedAt: '2026-10-24T06:00:00Z',
  },
  {
    id: 'task_8',
    projectId: 'proj_7',
    title: 'Filter out PII and payment card numbers before LLM sentiment evaluation',
    description: 'Regex strip credit cards and SSN patterns prior to calling local inference engine.',
    status: 'done',
    priority: 'critical',
    assignee: 'Amina Al-Mansoor',
    dueDate: '2026-10-21',
    createdAt: '2026-10-17T11:00:00Z',
    updatedAt: '2026-10-21T18:00:00Z',
  }
];

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_1',
    name: 'PR Code Hygiene & Security Gate',
    description: 'Parses incoming GitHub pull request diffs, executes AST security checks, summarizes risks with AI, and posts review remarks.',
    trigger: 'webhook',
    status: 'active',
    owner: 'Elena Rostova',
    projectId: 'proj_1',
    executionCount: 1420,
    successRate: 98.6,
    avgDurationMs: 640,
    lastExecutedAt: '2026-10-24T11:15:00Z',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-10-23T18:00:00Z',
    tags: ['Security', 'CI/CD', 'GitHub'],
    steps: [
      {
        id: 'step_1_1',
        title: 'Receive PR Webhook Payload',
        description: 'Validates JSON payload containing diff metadata and author details',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: JSON.stringify({
            repository: 'nexus/backend-core',
            pullRequestId: 492,
            author: 'm.vance',
            changedFiles: 8,
            diffSummary: 'Fix: handle socket disconnect gracefully and strip sensitive token parameters from connection query string.',
          }, null, 2)
        }
      },
      {
        id: 'step_1_2',
        title: 'AI Code & Vulnerability Summarizer',
        description: 'Analyzes code semantics, sentiment, and structural implications',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'ai_summarize'
        }
      },
      {
        id: 'step_1_3',
        title: 'Check Critical Sentiment Flag',
        description: 'Checks if summarizer flagged potential bugs or vulnerabilities',
        type: 'condition',
        order: 3,
        config: {
          conditionField: 'sentiment',
          conditionOperator: 'contains',
          conditionValue: 'Concerned'
        }
      },
      {
        id: 'step_1_4',
        title: 'Simulate GitHub Review Dispatch',
        description: 'Posts automated bot review feedback to simulated GitHub status check API',
        type: 'mock_api',
        order: 4,
        config: {
          apiEndpoint: '/api/v1/github/pulls/review',
          apiMethod: 'POST',
          simulatedLatencyMs: 320,
          simulatedStatus: 200,
        }
      },
      {
        id: 'step_1_5',
        title: 'Output Execution Status',
        description: 'Dispatches finalized result payload to console and audit logger',
        type: 'output',
        order: 5,
        config: {
          destination: 'console',
          outputTemplate: 'PR Gate Completed: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_2',
    name: 'Dependency Vulnerability Auto-Patching',
    description: 'Detects known CVE advisories in package.json/pom.xml, checks version compatibilities, and builds automated patch branch.',
    trigger: 'scheduled',
    status: 'active',
    owner: 'Elena Rostova',
    projectId: 'proj_1',
    executionCount: 512,
    successRate: 94.2,
    avgDurationMs: 890,
    lastExecutedAt: '2026-10-24T08:00:00Z',
    createdAt: '2026-08-10T14:00:00Z',
    updatedAt: '2026-10-20T12:00:00Z',
    tags: ['Security', 'CVE', 'Automation'],
    steps: [
      {
        id: 'step_2_1',
        title: 'Load Vulnerability Feed',
        description: 'Receives CVE feed items and package names',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"package": "lodash", "currentVersion": "4.17.20", "cve": "CVE-2021-23337", "severity": "HIGH"}'
        }
      },
      {
        id: 'step_2_2',
        title: 'Parse CVE Payload',
        description: 'Converts raw string to JSON object',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'json_parse'
        }
      },
      {
        id: 'step_2_3',
        title: 'Simulate Registry Patch Verification',
        description: 'Queries npm registry for latest non-vulnerable semantic release',
        type: 'mock_api',
        order: 3,
        config: {
          apiEndpoint: '/api/v1/npm/registry/check',
          apiMethod: 'GET',
          simulatedLatencyMs: 280,
          simulatedStatus: 200
        }
      },
      {
        id: 'step_2_4',
        title: 'Notify Security Team',
        description: 'Formats Slack security broadcast alert',
        type: 'output',
        order: 4,
        config: {
          destination: 'slack_mock',
          outputTemplate: '[CVE PATCH CREATED]: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_3',
    name: 'Vector Index Synchronization & Re-Index',
    description: 'Monitors newly updated documentation and workspace articles, generates embeddings, and updates Qdrant vector index.',
    trigger: 'event',
    status: 'active',
    owner: 'Marcus Vance',
    projectId: 'proj_2',
    executionCount: 3840,
    successRate: 99.8,
    avgDurationMs: 450,
    lastExecutedAt: '2026-10-24T11:30:00Z',
    createdAt: '2026-08-18T16:00:00Z',
    updatedAt: '2026-10-22T09:00:00Z',
    tags: ['Embeddings', 'Qdrant', 'Indexing'],
    steps: [
      {
        id: 'step_3_1',
        title: 'Ingest Document Payload',
        description: 'Accepts document title, content, and category',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: 'Deployment Guide: How to scale Kubernetes replica sets for high availability across multi-zone AWS nodes.'
        }
      },
      {
        id: 'step_3_2',
        title: 'Cleanse and Normalize Text',
        description: 'Extracts words and creates token-safe string',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'lowercase'
        }
      },
      {
        id: 'step_3_3',
        title: 'Simulate Vector Upsert Request',
        description: 'Transmits embedding vectors to Qdrant cluster',
        type: 'mock_api',
        order: 3,
        config: {
          apiEndpoint: '/api/v1/vectors/upsert',
          apiMethod: 'POST',
          simulatedLatencyMs: 210,
          simulatedStatus: 200
        }
      },
      {
        id: 'step_3_4',
        title: 'Complete Index Log',
        description: 'Records vector ingestion timestamp',
        type: 'output',
        order: 4,
        config: {
          destination: 'storage',
          outputTemplate: 'Indexed vector successfully: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_4',
    name: 'Continuous IAM Role Drift Detection',
    description: 'Scans AWS IAM permissions every 6 hours, detecting newly granted wildcards or over-privileged policies.',
    trigger: 'scheduled',
    status: 'active',
    owner: 'Sarah Chen',
    projectId: 'proj_3',
    executionCount: 220,
    successRate: 97.2,
    avgDurationMs: 1200,
    lastExecutedAt: '2026-10-24T06:00:00Z',
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-10-15T14:00:00Z',
    tags: ['IAM', 'Audit', 'Security'],
    steps: [
      {
        id: 'step_4_1',
        title: 'Fetch IAM Role Policies',
        description: 'Simulated IAM snapshot payload',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"role": "NexusExecutionRole", "statements": ["s3:GetObject", "kms:Decrypt", "iam:*"], "hasWildcard": true}'
        }
      },
      {
        id: 'step_4_2',
        title: 'Parse Policy JSON',
        description: 'Transforms string to JSON structure',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'json_parse'
        }
      },
      {
        id: 'step_4_3',
        title: 'Evaluate Wildcard Condition',
        description: 'Failsafe alert if policy has wildcard privileges',
        type: 'condition',
        order: 3,
        config: {
          conditionField: 'hasWildcard',
          conditionOperator: 'is_truthy',
          conditionValue: 'true'
        }
      },
      {
        id: 'step_4_4',
        title: 'Record Audit Compliance Check',
        description: 'Emits audit trail event',
        type: 'output',
        order: 4,
        config: {
          destination: 'storage',
          outputTemplate: 'IAM Drift Check Result: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_5',
    name: 'Edge Gateway Synthetic Ping & Healthcheck',
    description: 'Pings distributed edge nodes in Frankfurt, Oregon, Singapore, and Tokyo to measure latency spikes.',
    trigger: 'scheduled',
    status: 'active',
    owner: 'Marcus Vance',
    projectId: 'proj_4',
    executionCount: 8940,
    successRate: 99.9,
    avgDurationMs: 180,
    lastExecutedAt: '2026-10-24T11:40:00Z',
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
    tags: ['Edge', 'Latency', 'Healthcheck'],
    steps: [
      {
        id: 'step_5_1',
        title: 'Edge Ping Configuration',
        description: 'Specifies targeted regions',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"target": "edge.nexus-ai.internal", "regions": ["eu-central-1", "us-west-2", "ap-southeast-1"]}'
        }
      },
      {
        id: 'step_5_2',
        title: 'Execute Edge Probe API',
        description: 'Simulates fast roundtrip probe',
        type: 'mock_api',
        order: 2,
        config: {
          apiEndpoint: '/api/v1/edge/probe',
          apiMethod: 'GET',
          simulatedLatencyMs: 140,
          simulatedStatus: 200
        }
      },
      {
        id: 'step_5_3',
        title: 'Emit Health Metrics',
        description: 'Sends probe metrics to dashboard stream',
        type: 'output',
        order: 3,
        config: {
          destination: 'console',
          outputTemplate: 'Edge Probe Success: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_6',
    name: 'Staging Environment Smoke Test Suite',
    description: 'Executes simulated headless browser smoke tests after every deployment to verification cluster.',
    trigger: 'webhook',
    status: 'inactive',
    owner: 'Devon Wright',
    projectId: 'proj_5',
    executionCount: 180,
    successRate: 91.5,
    avgDurationMs: 1850,
    lastExecutedAt: '2026-10-18T16:30:00Z',
    createdAt: '2026-09-02T12:00:00Z',
    updatedAt: '2026-10-18T17:00:00Z',
    tags: ['Testing', 'Playwright', 'Staging'],
    steps: [
      {
        id: 'step_6_1',
        title: 'Deployment Trigger Input',
        description: 'Accepts deployment ID and staging host',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"deployId": "dep_91823", "targetUrl": "https://staging.nexus-ai.internal"}'
        }
      },
      {
        id: 'step_6_2',
        title: 'Simulate Test Suite Execution',
        description: 'Simulates 25 headless test runs with deliberate test duration',
        type: 'mock_api',
        order: 2,
        config: {
          apiEndpoint: '/api/v1/runner/e2e-smoke',
          apiMethod: 'POST',
          simulatedLatencyMs: 950,
          simulatedStatus: 200
        }
      },
      {
        id: 'step_6_3',
        title: 'Broadcast Smoke Test Result',
        description: 'Outputs final test results',
        type: 'output',
        order: 3,
        config: {
          destination: 'webhook',
          outputTemplate: 'Smoke Tests Summary: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_7',
    name: 'AI Commit Message & Release Notes Generator',
    description: 'Reads merged PR titles and commits, summarizes themes, and drafts Markdown release notes.',
    trigger: 'manual',
    status: 'active',
    owner: 'Elena Rostova',
    projectId: 'proj_1',
    executionCount: 420,
    successRate: 100.0,
    avgDurationMs: 510,
    lastExecutedAt: '2026-10-23T15:00:00Z',
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-10-23T15:00:00Z',
    tags: ['AI', 'Release', 'Markdown'],
    steps: [
      {
        id: 'step_7_1',
        title: 'Input Raw Commit Logs',
        description: 'Raw commit log lines for the upcoming sprint release',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: 'feat: add streaming token support. fix: resolve memory leak in worker threads. refactor: extract metrics middleware.'
        }
      },
      {
        id: 'step_7_2',
        title: 'Extract Commit Actions',
        description: 'Regex extracts feat/fix/refactor tags',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'regex_extract',
          regexPattern: '(feat|fix|refactor): [^.]+'
        }
      },
      {
        id: 'step_7_3',
        title: 'AI Release Summarizer',
        description: 'Generates structured bulleted notes',
        type: 'transform',
        order: 3,
        config: {
          transformOperation: 'ai_summarize'
        }
      },
      {
        id: 'step_7_4',
        title: 'Output Release Notes',
        description: 'Produces final Markdown preview',
        type: 'output',
        order: 4,
        config: {
          destination: 'console',
          outputTemplate: '# NEXUS Sprint Release Draft\n\n{{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_8',
    name: 'Dead Letter Queue (DLQ) Auto-Retry Worker',
    description: 'Polls unacknowledged event streams in Redis/Kafka and attempts deterministic recovery.',
    trigger: 'scheduled',
    status: 'active',
    owner: 'Marcus Vance',
    projectId: 'proj_2',
    executionCount: 1640,
    successRate: 96.1,
    avgDurationMs: 420,
    lastExecutedAt: '2026-10-24T11:00:00Z',
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-10-22T17:00:00Z',
    tags: ['DLQ', 'Kafka', 'Recovery'],
    steps: [
      {
        id: 'step_8_1',
        title: 'Read Failed Message Item',
        description: 'Payload of unhandled message from dead letter queue',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"msgId": "dlq_4041", "retryCount": 2, "payload": {"entity": "user_sync", "id": 992}}'
        }
      },
      {
        id: 'step_8_2',
        title: 'Delay Exponential Backoff',
        description: 'Simulates exponential backoff delay before re-dispatch',
        type: 'delay',
        order: 2,
        config: {
          delayDurationMs: 300
        }
      },
      {
        id: 'step_8_3',
        title: 'Simulate Replay API Call',
        description: 'Sends message back into main ingestion pipeline',
        type: 'mock_api',
        order: 3,
        config: {
          apiEndpoint: '/api/v1/queue/replay',
          apiMethod: 'POST',
          simulatedLatencyMs: 250,
          simulatedStatus: 200
        }
      },
      {
        id: 'step_8_4',
        title: 'Log DLQ Replay Confirmation',
        description: 'Logs recovery success',
        type: 'output',
        order: 4,
        config: {
          destination: 'console',
          outputTemplate: 'DLQ Replay Acknowledged: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_9',
    name: 'Customer Support Escalation Classifier',
    description: 'Evaluates urgent support tickets, detects negative sentiment or SLA breaches, and pages tier-3 on-call engineers.',
    trigger: 'webhook',
    status: 'active',
    owner: 'Sarah Chen',
    projectId: 'proj_7',
    executionCount: 1290,
    successRate: 98.9,
    avgDurationMs: 380,
    lastExecutedAt: '2026-10-24T10:45:00Z',
    createdAt: '2026-09-18T14:00:00Z',
    updatedAt: '2026-10-24T09:00:00Z',
    tags: ['CustomerSuccess', 'Sentiment', 'PagerDuty'],
    steps: [
      {
        id: 'step_9_1',
        title: 'Inbound Ticket Text',
        description: 'Customer ticket body and account tier',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: 'CRITICAL ERROR: Our production API keys were disabled unexpectedly during midday billing run. Please restore immediately!'
        }
      },
      {
        id: 'step_9_2',
        title: 'Sentiment & Threat Analysis',
        description: 'Analyzes ticket severity and user frustration tone',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'ai_summarize'
        }
      },
      {
        id: 'step_9_3',
        title: 'Simulate PagerDuty Trigger',
        description: 'Simulates incident dispatch to on-call duty engineer',
        type: 'mock_api',
        order: 3,
        config: {
          apiEndpoint: '/api/v1/pagerduty/incident',
          apiMethod: 'POST',
          simulatedLatencyMs: 310,
          simulatedStatus: 200
        }
      },
      {
        id: 'step_9_4',
        title: 'Escalation Response Output',
        description: 'Dispatches confirmation to support queue',
        type: 'output',
        order: 4,
        config: {
          destination: 'slack_mock',
          outputTemplate: 'Support Escalation Paged: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_10',
    name: 'GPU Cluster Temperature & Memory Throttling Guard',
    description: 'Gathers nvidia-smi telemetry from training nodes, auto-scales fan speeds, and balances load if memory threshold reaches 95%.',
    trigger: 'scheduled',
    status: 'active',
    owner: 'Amina Al-Mansoor',
    projectId: 'proj_6',
    executionCount: 14500,
    successRate: 99.9,
    avgDurationMs: 120,
    lastExecutedAt: '2026-10-24T11:42:00Z',
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    tags: ['GPU', 'H100', 'Telemetry', 'Hardware'],
    steps: [
      {
        id: 'step_10_1',
        title: 'Receive Node Telemetry',
        description: 'Memory used and temperature readings',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"nodeId": "gpu-h100-rack-04", "tempC": 68, "memoryUsagePercent": 84, "powerDrawWatts": 450}'
        }
      },
      {
        id: 'step_10_2',
        title: 'Parse Telemetry JSON',
        description: 'Converts telemetry string to JSON',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'json_parse'
        }
      },
      {
        id: 'step_10_3',
        title: 'Check Temperature Safety Threshold',
        description: 'Verifies temperature is below 85C',
        type: 'condition',
        order: 3,
        config: {
          conditionField: 'tempC',
          conditionOperator: 'less_than',
          conditionValue: '85'
        }
      },
      {
        id: 'step_10_4',
        title: 'Broadcast Metric Stream',
        description: 'Pushes hardware metrics to cluster supervisor',
        type: 'output',
        order: 4,
        config: {
          destination: 'console',
          outputTemplate: 'GPU Node Verified Safe: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_11',
    name: 'Automated Invoice Reconciliation & Tax Validator',
    description: 'Parses monthly Stripe webhook invoices, cross-references corporate ERP ledger, and flags mismatched line items.',
    trigger: 'webhook',
    status: 'draft',
    owner: 'Sarah Chen',
    projectId: 'proj_7',
    executionCount: 45,
    successRate: 93.3,
    avgDurationMs: 740,
    lastExecutedAt: '2026-10-21T09:00:00Z',
    createdAt: '2026-10-01T15:00:00Z',
    updatedAt: '2026-10-21T09:00:00Z',
    tags: ['Finance', 'Stripe', 'ERP'],
    steps: [
      {
        id: 'step_11_1',
        title: 'Invoice Webhook Ingestion',
        description: 'Incoming Stripe invoice payment object',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"invoiceId": "in_109283", "amountDue": 48500, "currency": "usd", "customer": "Acme Global Enterprise"}'
        }
      },
      {
        id: 'step_11_2',
        title: 'Format Ledger Entry',
        description: 'Stringifies formatted data payload',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'json_parse'
        }
      },
      {
        id: 'step_11_3',
        title: 'Confirm ERP Sync',
        description: 'Outputs ledger sync record',
        type: 'output',
        order: 3,
        config: {
          destination: 'storage',
          outputTemplate: 'Reconciliation Stored: {{data}}'
        }
      }
    ]
  },
  {
    id: 'wf_12',
    name: 'Ephemeral Dev Environment Cleanup Cron',
    description: 'Identifies feature preview Kubernetes namespaces with zero traffic for over 72 hours and deletes them safely.',
    trigger: 'scheduled',
    status: 'active',
    owner: 'Devon Wright',
    projectId: 'proj_8',
    executionCount: 310,
    successRate: 99.4,
    avgDurationMs: 490,
    lastExecutedAt: '2026-10-24T04:00:00Z',
    createdAt: '2026-06-15T08:00:00Z',
    updatedAt: '2026-10-23T20:00:00Z',
    tags: ['K8s', 'Cleanup', 'DevOps', 'CostOptimization'],
    steps: [
      {
        id: 'step_12_1',
        title: 'Preview Namespace List',
        description: 'List of candidate namespaces',
        type: 'input',
        order: 1,
        config: {
          defaultPayload: '{"namespaces": ["pr-302-preview", "test-auth-spike", "demo-ui-v2"], "idleThresholdHours": 72}'
        }
      },
      {
        id: 'step_12_2',
        title: 'Parse Namespace Candidates',
        description: 'Extracts namespace data',
        type: 'transform',
        order: 2,
        config: {
          transformOperation: 'json_parse'
        }
      },
      {
        id: 'step_12_3',
        title: 'Simulate K8s Delete Call',
        description: 'Executes simulated kubectl delete call',
        type: 'mock_api',
        order: 3,
        config: {
          apiEndpoint: '/api/v1/k8s/namespaces/cleanup',
          apiMethod: 'DELETE',
          simulatedLatencyMs: 380,
          simulatedStatus: 200
        }
      },
      {
        id: 'step_12_4',
        title: 'Log Cost Savings Report',
        description: 'Emits estimated cloud cost reclaimed',
        type: 'output',
        order: 4,
        config: {
          destination: 'console',
          outputTemplate: 'Cleaned Ephemeral Environments. Estimated $420/month saved: {{data}}'
        }
      }
    ]
  }
];

export const INITIAL_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act_1',
    type: 'workflow_executed',
    title: 'Edge Gateway Synthetic Ping & Healthcheck executed',
    description: 'Automated 15-minute synthetic latency probe completed with 100% success across all regions.',
    actor: { name: 'System Daemon', role: 'Automation' },
    targetId: 'wf_5',
    targetType: 'workflow',
    timestamp: '2026-10-24T11:40:00Z',
  },
  {
    id: 'act_2',
    type: 'workflow_executed',
    title: 'Vector Index Synchronization & Re-Index completed',
    description: 'Upserted 240 new documentation embeddings into Qdrant index with zero dropped vectors.',
    actor: { name: 'Marcus Vance', role: 'Admin' },
    targetId: 'wf_3',
    targetType: 'workflow',
    timestamp: '2026-10-24T11:30:00Z',
  },
  {
    id: 'act_3',
    type: 'workflow_executed',
    title: 'PR Code Hygiene & Security Gate passed',
    description: 'Scanned PR #492 in repo nexus/backend-core. AST security checks verified clean.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'wf_1',
    targetType: 'workflow',
    timestamp: '2026-10-24T11:15:00Z',
  },
  {
    id: 'act_4',
    type: 'task_completed',
    title: 'Task marked complete: Filter PII and payment cards',
    description: 'Amina Al-Mansoor completed task on Customer Support Telemetry Ingestion.',
    actor: { name: 'Amina Al-Mansoor', role: 'Member' },
    targetId: 'task_8',
    targetType: 'task',
    timestamp: '2026-10-24T10:50:00Z',
  },
  {
    id: 'act_5',
    type: 'workflow_executed',
    title: 'Customer Support Escalation Classifier triggered',
    description: 'Urgent enterprise ticket parsed and routed to on-call team with high priority escalation.',
    actor: { name: 'Sarah Chen', role: 'Admin' },
    targetId: 'wf_9',
    targetType: 'workflow',
    timestamp: '2026-10-24T10:45:00Z',
  },
  {
    id: 'act_6',
    type: 'project_updated',
    title: 'Updated Distributed Vector Memory Indexer',
    description: 'Progress incremented to 92% following successful benchmark completion.',
    actor: { name: 'Marcus Vance', role: 'Admin' },
    targetId: 'proj_2',
    targetType: 'project',
    timestamp: '2026-10-24T08:15:00Z',
  },
  {
    id: 'act_7',
    type: 'workflow_executed',
    title: 'Dependency Vulnerability Auto-Patching completed',
    description: 'Evaluated npm advisory CVE-2021-23337 and generated automated pull request patch.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'wf_2',
    targetType: 'workflow',
    timestamp: '2026-10-24T08:00:00Z',
  },
  {
    id: 'act_8',
    type: 'workflow_executed',
    title: 'Continuous IAM Role Drift Detection executed',
    description: 'Evaluated 48 IAM roles across production accounts. No unauthorized wildcards detected.',
    actor: { name: 'System Daemon', role: 'Automation' },
    targetId: 'wf_4',
    targetType: 'workflow',
    timestamp: '2026-10-24T06:00:00Z',
  },
  {
    id: 'act_9',
    type: 'workflow_executed',
    title: 'Ephemeral Dev Environment Cleanup Cron ran',
    description: 'Pruned 3 stale feature branches and reclaimed 12 GB RAM in staging namespace.',
    actor: { name: 'Devon Wright', role: 'Member' },
    targetId: 'wf_12',
    targetType: 'workflow',
    timestamp: '2026-10-24T04:00:00Z',
  },
  {
    id: 'act_10',
    type: 'task_created',
    title: 'New task created: Add webhook signature verification',
    description: 'Devon Wright created task for Autonomous Code Review Agent.',
    actor: { name: 'Devon Wright', role: 'Member' },
    targetId: 'task_3',
    targetType: 'task',
    timestamp: '2026-10-23T16:20:00Z',
  },
  {
    id: 'act_11',
    type: 'workflow_executed',
    title: 'AI Commit Message & Release Notes Generator run',
    description: 'Compiled sprint release notes draft for release v2.8.0.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'wf_7',
    targetType: 'workflow',
    timestamp: '2026-10-23T15:00:00Z',
  },
  {
    id: 'act_12',
    type: 'project_updated',
    title: 'Autonomous Code Review Agent updated',
    description: 'Updated OWASP rules mapping and target launch date.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'proj_1',
    targetType: 'project',
    timestamp: '2026-10-23T14:30:00Z',
  },
  {
    id: 'act_13',
    type: 'task_completed',
    title: 'Task completed: Benchmark Qdrant Cosine vs HNSW index',
    description: 'Scalar quantization validated with 4x memory compression and <2% recall reduction.',
    actor: { name: 'Marcus Vance', role: 'Admin' },
    targetId: 'task_4',
    targetType: 'task',
    timestamp: '2026-10-20T17:30:00Z',
  },
  {
    id: 'act_14',
    type: 'team_member_added',
    title: 'Liam Gallagher joined workspace',
    description: 'Invited as Developer Operations Viewer by Sarah Chen.',
    actor: { name: 'Sarah Chen', role: 'Admin' },
    targetId: 'user_6',
    targetType: 'team',
    timestamp: '2026-10-20T11:00:00Z',
  },
  {
    id: 'act_15',
    type: 'settings_updated',
    title: 'Workspace Security Policy updated',
    description: 'Enforced 2FA and strict session timeout for all administrative actions.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'settings',
    targetType: 'settings',
    timestamp: '2026-10-19T14:10:00Z',
  },
  {
    id: 'act_16',
    type: 'task_completed',
    title: 'Task completed: Integrate AST parser with tree-sitter',
    description: 'Merged AST parser support for TypeScript and Rust syntax engines.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'task_1',
    targetType: 'task',
    timestamp: '2026-10-18T16:00:00Z',
  },
  {
    id: 'act_17',
    type: 'workflow_created',
    title: 'Created Customer Support Escalation Classifier',
    description: 'Configured new sentiment analysis workflow with automatic on-call routing.',
    actor: { name: 'Sarah Chen', role: 'Admin' },
    targetId: 'wf_9',
    targetType: 'workflow',
    timestamp: '2026-09-18T14:00:00Z',
  },
  {
    id: 'act_18',
    type: 'project_created',
    title: 'New project created: SOC2 Type II Automated Compliance Audit',
    description: 'Initiated compliance architecture tracking project for external audit preparation.',
    actor: { name: 'Sarah Chen', role: 'Admin' },
    targetId: 'proj_3',
    targetType: 'project',
    timestamp: '2026-09-10T16:00:00Z',
  },
  {
    id: 'act_19',
    type: 'project_created',
    title: 'New project created: Multi-Tenant Edge Gateway v3',
    description: 'High-performance Rust edge routing service initiative registered.',
    actor: { name: 'Marcus Vance', role: 'Admin' },
    targetId: 'proj_4',
    targetType: 'project',
    timestamp: '2026-08-20T13:10:00Z',
  },
  {
    id: 'act_20',
    type: 'workflow_created',
    title: 'Created Vector Index Synchronization & Re-Index',
    description: 'Configured real-time doc embedding pipeline connected to Qdrant cluster.',
    actor: { name: 'Marcus Vance', role: 'Admin' },
    targetId: 'wf_3',
    targetType: 'workflow',
    timestamp: '2026-08-18T16:00:00Z',
  },
  {
    id: 'act_21',
    type: 'project_created',
    title: 'New project created: Autonomous Code Review Agent',
    description: 'Flagship AI agent initiative initialized for enterprise PR workflows.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'proj_1',
    targetType: 'project',
    timestamp: '2026-08-01T09:00:00Z',
  },
  {
    id: 'act_22',
    type: 'workflow_created',
    title: 'Created PR Code Hygiene & Security Gate',
    description: 'Initial pipeline definition configured with AST parsing and AI summarizer.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'wf_1',
    targetType: 'workflow',
    timestamp: '2026-08-05T10:00:00Z',
  },
  {
    id: 'act_23',
    type: 'workflow_executed',
    title: 'GPU Cluster Temperature Guard passed hourly healthcheck',
    description: 'All 8 H100 nodes confirmed within normal operating temperature bands (68C-72C).',
    actor: { name: 'Amina Al-Mansoor', role: 'Member' },
    targetId: 'wf_10',
    targetType: 'workflow',
    timestamp: '2026-10-24T11:42:00Z',
  },
  {
    id: 'act_24',
    type: 'workflow_executed',
    title: 'DLQ Auto-Retry Worker executed',
    description: 'Replayed 14 messages with 100% recovery rate.',
    actor: { name: 'System Daemon', role: 'Automation' },
    targetId: 'wf_8',
    targetType: 'workflow',
    timestamp: '2026-10-24T11:00:00Z',
  },
  {
    id: 'act_25',
    type: 'task_created',
    title: 'New task created: Configure automated snapshot backups to S3',
    description: 'Added task under Distributed Vector Memory Indexer project.',
    actor: { name: 'Marcus Vance', role: 'Admin' },
    targetId: 'task_5',
    targetType: 'task',
    timestamp: '2026-10-21T13:45:00Z',
  },
  {
    id: 'act_26',
    type: 'task_created',
    title: 'New task created: Draft SOC2 Trust Services Criteria mapping',
    description: 'Assigned to Sarah Chen under Compliance Audit project.',
    actor: { name: 'Sarah Chen', role: 'Admin' },
    targetId: 'task_6',
    targetType: 'task',
    timestamp: '2026-10-15T09:00:00Z',
  },
  {
    id: 'act_27',
    type: 'project_updated',
    title: 'LLM Fine-Tuning & Quantization Pipeline marked Completed',
    description: 'Achieved 4-bit AWQ deployment on production inference cluster.',
    actor: { name: 'Amina Al-Mansoor', role: 'Member' },
    targetId: 'proj_6',
    targetType: 'project',
    timestamp: '2026-10-12T15:20:00Z',
  },
  {
    id: 'act_28',
    type: 'team_member_added',
    title: 'Amina Al-Mansoor joined workspace',
    description: 'Added to Machine Learning Infrastructure team.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'user_5',
    targetType: 'team',
    timestamp: '2026-04-12T10:00:00Z',
  },
  {
    id: 'act_29',
    type: 'project_created',
    title: 'New project created: Customer Support Telemetry Ingestion',
    description: 'Registered real-time NLP classification project.',
    actor: { name: 'Sarah Chen', role: 'Admin' },
    targetId: 'proj_7',
    targetType: 'project',
    timestamp: '2026-09-15T12:00:00Z',
  },
  {
    id: 'act_30',
    type: 'settings_updated',
    title: 'Default dashboard telemetry widgets reconfigured',
    description: 'Elena Rostova pinned execution trend analytics and active projects feed.',
    actor: { name: 'Elena Rostova', role: 'Owner' },
    targetId: 'settings',
    targetType: 'settings',
    timestamp: '2026-10-22T08:00:00Z',
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    category: 'workflow',
    title: 'Workflow Execution Milestone',
    message: 'PR Code Hygiene & Security Gate crossed 1,400 successful executions this month.',
    read: false,
    timestamp: '2026-10-24T11:15:00Z',
    targetUrl: '/workflows/wf_1',
    priority: 'low',
  },
  {
    id: 'notif_2',
    category: 'security',
    title: 'New CVE Advisory Detected',
    message: 'CVE-2021-23337 auto-patched by automated vulnerability pipeline.',
    read: false,
    timestamp: '2026-10-24T08:00:00Z',
    targetUrl: '/workflows/wf_2',
    priority: 'high',
  },
  {
    id: 'notif_3',
    category: 'project',
    title: 'Project Milestone Achieved',
    message: 'Distributed Vector Memory Indexer reached 92% completion threshold.',
    read: false,
    timestamp: '2026-10-24T08:15:00Z',
    targetUrl: '/projects/proj_2',
    priority: 'medium',
  },
  {
    id: 'notif_4',
    category: 'team',
    title: 'New Team Member Onboarded',
    message: 'Liam Gallagher accepted the invite and joined as Viewer.',
    read: true,
    timestamp: '2026-10-20T11:00:00Z',
    targetUrl: '/team',
    priority: 'low',
  },
  {
    id: 'notif_5',
    category: 'workflow',
    title: 'Customer Escalation Dispatched',
    message: 'Critical sentiment detected on incoming billing inquiry ticket #819.',
    read: true,
    timestamp: '2026-10-24T10:45:00Z',
    targetUrl: '/workflows/wf_9',
    priority: 'critical',
  },
  {
    id: 'notif_6',
    category: 'system',
    title: 'Automated Snapshot Verified',
    message: 'Encrypted S3 backup snapshot verified clean across all Qdrant vectors.',
    read: true,
    timestamp: '2026-10-23T00:00:00Z',
    targetUrl: '/projects/proj_2',
    priority: 'low',
  },
  {
    id: 'notif_7',
    category: 'project',
    title: 'Task Assigned To You',
    message: 'Elena Rostova assigned "OWASP Top 10 security verification prompt" to you.',
    read: true,
    timestamp: '2026-10-19T09:30:00Z',
    targetUrl: '/projects/proj_1',
    priority: 'high',
  },
  {
    id: 'notif_8',
    category: 'security',
    title: 'IAM Policy Audit Completed',
    message: 'Zero wildcard permissions found during bi-weekly automated compliance scan.',
    read: true,
    timestamp: '2026-10-24T06:00:00Z',
    targetUrl: '/workflows/wf_4',
    priority: 'low',
  },
  {
    id: 'notif_9',
    category: 'system',
    title: 'Storage Optimization Reclaimed Space',
    message: 'Ephemeral Dev Environment Cleanup Cron freed 12 GB in staging cluster.',
    read: true,
    timestamp: '2026-10-24T04:00:00Z',
    targetUrl: '/workflows/wf_12',
    priority: 'low',
  },
  {
    id: 'notif_10',
    category: 'system',
    title: 'NEXUS Platform Version v2.8.4 Active',
    message: 'Deterministic AI execution engine and dark theme contrast enhancements are live.',
    read: true,
    timestamp: '2026-10-22T08:00:00Z',
    targetUrl: '/settings',
    priority: 'low',
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  profile: {
    id: 'user_1',
    name: 'Elena Rostova',
    email: 'elena.rostova@nexus-ai.internal',
    role: 'Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    workspaceName: 'NEXUS Autonomous Core',
    jobTitle: 'Principal AI Systems Architect',
    timezone: 'UTC+00:00 (London, Dublin)',
  },
  appearance: {
    theme: 'dark',
    accentColor: '#6366F1',
    compactMode: false,
  },
  notifications: {
    emailAlerts: true,
    workflowFailures: true,
    taskAssignments: true,
    weeklyDigest: false,
  },
  dashboardWidgets: {
    kpiCards: true,
    executionsChart: true,
    workflowTypes: true,
    recentProjects: true,
    activityFeed: true,
  }
};
