import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  Calendar, 
  Download, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  GitCompare
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { BarChart } from '../components/charts/BarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const Analytics: React.FC = () => {
  const { workflows, projects } = useAppData();
  const { success } = useToast();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metricType, setMetricType] = useState<'executions' | 'latency' | 'successRate'>('executions');
  const [compareMode, setCompareMode] = useState<boolean>(true);

  // Aggregated totals
  const totalExecutions = workflows.reduce((acc, w) => acc + w.executionCount, 0);
  const avgSuccessRate = workflows.length > 0
    ? (workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length).toFixed(1)
    : '100';
  const avgLatency = workflows.length > 0
    ? Math.round(workflows.reduce((acc, w) => acc + w.avgDurationMs, 0) / workflows.length)
    : 350;

  // Realistic deterministic time-series tailored to selected range
  const timeSeriesData = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { date: 'Oct 18', value: 2600, secondaryValue: 2300 },
        { date: 'Oct 19', value: 2750, secondaryValue: 2410 },
        { date: 'Oct 20', value: 2900, secondaryValue: 2520 },
        { date: 'Oct 21', value: 2840, secondaryValue: 2610 },
        { date: 'Oct 22', value: 3150, secondaryValue: 2750 },
        { date: 'Oct 23', value: 3400, secondaryValue: 2900 },
        { date: 'Oct 24', value: 3620, secondaryValue: 3050 },
      ];
    } else if (dateRange === '90d') {
      return [
        { date: 'Aug 01', value: 1100, secondaryValue: 950 },
        { date: 'Aug 15', value: 1450, secondaryValue: 1200 },
        { date: 'Sep 01', value: 1890, secondaryValue: 1600 },
        { date: 'Sep 15', value: 2300, secondaryValue: 2000 },
        { date: 'Oct 01', value: 2750, secondaryValue: 2350 },
        { date: 'Oct 15', value: 3200, secondaryValue: 2800 },
        { date: 'Oct 24', value: 3620, secondaryValue: 3100 },
      ];
    }
    // 30d
    return [
      { date: 'Sep 25', value: 1650, secondaryValue: 1400 },
      { date: 'Sep 29', value: 1820, secondaryValue: 1550 },
      { date: 'Oct 03', value: 2100, secondaryValue: 1780 },
      { date: 'Oct 07', value: 2350, secondaryValue: 2010 },
      { date: 'Oct 11', value: 2580, secondaryValue: 2240 },
      { date: 'Oct 15', value: 2920, secondaryValue: 2500 },
      { date: 'Oct 19', value: 3250, secondaryValue: 2810 },
      { date: 'Oct 24', value: 3620, secondaryValue: 3050 },
    ];
  }, [dateRange]);

  // Success vs Failure comparative bar chart
  const comparativeBarData = [
    { label: 'Security Gate', success: 1395, failure: 25 },
    { label: 'Vector Sync', success: 3832, failure: 8 },
    { label: 'IAM Drift', success: 214, failure: 6 },
    { label: 'Edge Probes', success: 8931, failure: 9 },
    { label: 'Auto-Patch', success: 482, failure: 30 },
    { label: 'GPU Throttling', success: 14485, failure: 15 },
  ];

  // Failure categories donut
  const errorDistributionData = [
    { label: 'Timeout Exceeded', value: 42, color: '#EF4444' },
    { label: 'JSON Parse Failure', value: 28, color: '#F59E0B' },
    { label: 'Condition Mismatch', value: 18, color: '#6366F1' },
    { label: 'Mock Gateway 500', value: 12, color: '#06B6D4' },
  ];

  // CSV Export Generator
  const handleExportCSV = () => {
    const headers = ['Workflow Name', 'Trigger', 'Status', 'Execution Count', 'Success Rate (%)', 'Avg Latency (ms)', 'Owner'];
    const rows = workflows.map(w => [
      `"${w.name.replace(/"/g, '""')}"`,
      `"${w.trigger}"`,
      `"${w.status}"`,
      w.executionCount,
      w.successRate,
      w.avgDurationMs,
      `"${w.owner.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexus-analytics-${dateRange}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success('CSV Export Generated', `Exported telemetry records for ${workflows.length} workflows.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
            Analytics & System Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
            Real-time pipeline performance, error diagnostics, and throughput rankings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range toggle */}
          <div className="flex items-center rounded-xl bg-nexus-surface border border-nexus-border p-1 text-xs">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  dateRange === range
                    ? 'bg-nexus-elevated text-nexus-text shadow-sm'
                    : 'text-nexus-text-dim hover:text-nexus-text'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Comparison Mode Toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              compareMode
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-nexus-surface text-nexus-text-dim border-nexus-border hover:text-nexus-text'
            }`}
            title="Toggle Period Comparison View"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Periods</span>
          </button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Comparison Mode Variance Banner */}
      {compareMode && (
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="font-semibold text-indigo-300 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-400" />
              Comparative Period Analysis: Current {dateRange.toUpperCase()} vs Prior {dateRange.toUpperCase()}
            </span>
            <span className="text-[11px] font-mono text-emerald-400">Net Efficiency Gain: +21.4%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
              <span className="text-[10px] text-nexus-text-dim block">Volume Delta</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">+6,130 runs (+24.1%)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
              <span className="text-[10px] text-nexus-text-dim block">Reliability Variance</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">+0.4% higher</span>
            </div>
            <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
              <span className="text-[10px] text-nexus-text-dim block">Speedup Delta</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">-12ms latency</span>
            </div>
            <div className="p-2.5 rounded-xl bg-nexus-base border border-nexus-border">
              <span className="text-[10px] text-nexus-text-dim block">Error Suppression</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">-18 caught faults</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-nexus-text-muted font-medium block">Total Ingestion Volume</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-nexus-text font-mono">
              {totalExecutions.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24.1%
            </span>
          </div>
          <p className="text-[11px] text-nexus-text-dim mt-2">vs {dateRange === '7d' ? 'previous 7 days' : 'prior cycle'}</p>
        </div>

        <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-nexus-text-muted font-medium block">Global Success Ratio</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
              {avgSuccessRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +0.4%
            </span>
          </div>
          <p className="text-[11px] text-nexus-text-dim mt-2">Across all 12 orchestrated workflows</p>
        </div>

        <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-nexus-text-muted font-medium block">Mean Step Latency</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono">
              {avgLatency}ms
            </span>
            <span className="text-xs font-semibold text-cyan-400 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" /> -12ms
            </span>
          </div>
          <p className="text-[11px] text-nexus-text-dim mt-2">Local deterministic runtime execution</p>
        </div>
      </div>

      {/* Main Trends Time Series */}
      <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-nexus-text">Execution Throughput Trend</h2>
            <p className="text-xs text-nexus-text-muted mt-0.5">
              Historical timeline compared against trailing period benchmark
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setMetricType('executions')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                metricType === 'executions'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
            >
              Runs
            </button>
            <button
              onClick={() => setMetricType('latency')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                metricType === 'latency'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
            >
              Latency
            </button>
          </div>
        </div>

        <TimeSeriesChart
          data={timeSeriesData}
          primaryLabel={`Selected Period (${dateRange.toUpperCase()})`}
          secondaryLabel="Prior Equivalent Period"
          unit={metricType === 'latency' ? 'ms' : 'runs'}
          color={metricType === 'latency' ? '#06B6D4' : '#6366F1'}
        />
      </div>

      {/* Comparative Bar Chart & Error Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success vs Failure Bar Chart */}
        <div className="lg:col-span-2 bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-semibold text-nexus-text">Pipeline Reliability Matrix</h2>
            <p className="text-xs text-nexus-text-muted mt-0.5">
              Success vs failure counts across key production workflows
            </p>
          </div>
          <BarChart data={comparativeBarData} height={210} />
        </div>

        {/* Error distribution donut */}
        <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-nexus-text">Exception Breakdown</h2>
            <p className="text-xs text-nexus-text-muted mt-0.5">
              Distribution of handled and caught pipeline failures
            </p>
          </div>

          <div className="my-auto py-2">
            <DonutChart data={errorDistributionData} centerLabel="Errors" size={170} />
          </div>

          <div className="text-[11px] text-nexus-text-dim pt-3 border-t border-nexus-border text-center">
            All failures safely caught by local recovery engine.
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-nexus-surface border border-nexus-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-nexus-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-nexus-text">Workflow Performance Rankings</h2>
            <p className="text-xs text-nexus-text-muted mt-0.5">
              Sortable execution throughput, reliability, and speed metrics
            </p>
          </div>
          <span className="text-xs font-mono text-nexus-text-dim">{workflows.length} pipelines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-nexus-base border-b border-nexus-border text-nexus-text-dim uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Rank & Workflow</th>
                <th className="py-3 px-4 font-medium">Trigger</th>
                <th className="py-3 px-4 font-medium">Total Runs</th>
                <th className="py-3 px-4 font-medium">Success Rate</th>
                <th className="py-3 px-4 font-medium">Avg Latency</th>
                <th className="py-3 px-4 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border text-nexus-text">
              {[...workflows]
                .sort((a, b) => b.executionCount - a.executionCount)
                .map((wf, idx) => (
                  <tr key={wf.id} className="hover:bg-nexus-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-nexus-text flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-nexus-base border border-nexus-border flex items-center justify-center font-mono text-[10px] text-nexus-text-dim shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{wf.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize">{wf.trigger}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-nexus-text">
                      {wf.executionCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                      {wf.successRate}%
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {wf.avgDurationMs}ms
                    </td>
                    <td className="py-3 px-4 text-nexus-text-muted">{wf.owner}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
