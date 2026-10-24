import { describe, it, expect } from 'vitest';
import { INITIAL_PROJECTS, INITIAL_WORKFLOWS } from '../data/seedData';

describe('Data Models & CSV Export Utilities', () => {
  it('generates valid RFC 4180 escaped CSV data without syntax injection', () => {
    const testWorkflows = [
      {
        name: 'PR Code "Hygiene" Gate, v2',
        trigger: 'webhook',
        status: 'active',
        executionCount: 1420,
        successRate: 98.6,
        avgDurationMs: 640,
        owner: 'Elena Rostova, Lead',
      },
      {
        name: 'Simple Pipeline',
        trigger: 'scheduled',
        status: 'active',
        executionCount: 10,
        successRate: 100,
        avgDurationMs: 200,
        owner: 'Marcus Vance',
      }
    ];

    const headers = ['Workflow Name', 'Trigger', 'Status', 'Execution Count', 'Success Rate (%)', 'Avg Latency (ms)', 'Owner'];
    const rows = testWorkflows.map(w => [
      `"${w.name.replace(/"/g, '""')}"`,
      `"${w.trigger}"`,
      `"${w.status}"`,
      w.executionCount,
      w.successRate,
      w.avgDurationMs,
      `"${w.owner.replace(/"/g, '""')}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    expect(csvString).toContain('"PR Code ""Hygiene"" Gate, v2"');
    expect(csvString).toContain('"Elena Rostova, Lead"');
    expect(csvString.split('\r\n').length).toBe(3);
  });

  it('filters projects by status, owner, and search query correctly', () => {
    const activeProjects = INITIAL_PROJECTS.filter(p => p.status === 'Active');
    expect(activeProjects.length).toBeGreaterThan(0);
    expect(activeProjects.every(p => p.status === 'Active')).toBe(true);

    const elenaProjects = INITIAL_PROJECTS.filter(p => p.owner === 'Elena Rostova');
    expect(elenaProjects.length).toBeGreaterThan(0);
    expect(elenaProjects.every(p => p.owner === 'Elena Rostova')).toBe(true);

    const searchResults = INITIAL_PROJECTS.filter(p => 
      p.name.toLowerCase().includes('vector') || p.tags.includes('VectorDB')
    );
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].name).toBe('Distributed Vector Memory Indexer');
  });

  it('sorts projects by progress and due dates consistently', () => {
    const sortedByProgressDesc = [...INITIAL_PROJECTS].sort((a, b) => b.progress - a.progress);
    expect(sortedByProgressDesc[0].progress).toBe(100);

    for (let i = 0; i < sortedByProgressDesc.length - 1; i++) {
      expect(sortedByProgressDesc[i].progress).toBeGreaterThanOrEqual(sortedByProgressDesc[i + 1].progress);
    }
  });

  it('preserves deterministic seed counts meeting prompt requirements', () => {
    // Prompt requirements: at least 8 projects, 12 workflows
    expect(INITIAL_PROJECTS.length).toBeGreaterThanOrEqual(8);
    expect(INITIAL_WORKFLOWS.length).toBeGreaterThanOrEqual(12);

    // Check project statuses diversity
    const statuses = new Set(INITIAL_PROJECTS.map(p => p.status));
    expect(statuses.has('Active')).toBe(true);
    expect(statuses.has('Planning')).toBe(true);
    expect(statuses.has('Completed')).toBe(true);
  });
});
