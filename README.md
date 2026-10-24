# NEXUS — AI Command Center

> **"One command center. Every workflow in motion."**
> A venture-backed, production-grade SaaS web application for engineering teams to orchestrate AI pipelines, manage projects and milestones, inspect telemetry analytics, and monitor system health.

---

## 1. Executive Summary

NEXUS was engineered to feel like an enterprise SaaS platform built for high-velocity software engineering, AI architecture, DevSecOps, and product teams. It replaces disjointed admin templates with a cohesive, unified command center built on a deterministic local execution engine, real-time responsive SVG telemetry charts, a global keyboard command palette (`Ctrl+K`), and fine-grained project and task tracking.

---

## 2. Technology Stack & Significant Dependencies

- **Core & Framework**: React 18.3, TypeScript 5.7, Vite 6.0
- **Routing**: React Router DOM 6.28 (multi-page routing with URL parameters, route guards, dynamic history)
- **Styling & Design Tokens**: Tailwind CSS 3.4 + Custom CSS Custom Properties (`--color-bg-base: #090B10`, `--color-bg-surface: #11151D`, `--color-bg-elevated: #171D28`, electric violet `#6366F1` & cyan `#06B6D4` accents)
- **Iconography**: `lucide-react` (uniform, modern vector icons)
- **Charts**: Custom responsive SVG Area/Line Charts (`TimeSeriesChart`), Donut Arcs (`DonutChart`), Comparative Dual Bars (`BarChart`), and Sparklines (`MetricCard`) with zero bloated charting library bugs, full accessibility summaries, and interactive tooltips
- **Execution Engine**: Custom deterministic local workflow runner with step execution logging, abort cancellation (`AbortSignal`), mock API latency simulation, and sentiment analysis
- **Test Framework**: Vitest 2.1 with `@testing-library/react` and `jsdom`

---

## 3. Implemented Routes

| Route | View | Description |
|---|---|---|
| `/login` | Authentication & Onboarding | Demo 1-click access, client-side validation, password visibility toggle, remember session, registration tab |
| `/dashboard` | Command Center | Executive KPI cards, execution velocity chart, trigger architecture donut, recent projects, live activity stream, widget layout customization |
| `/projects` | Project Initiatives | Grid & List views, status/owner/tag filters, sorting, creation modal with validation, deletion confirmation |
| `/projects/:id` | Project Detail | Progress velocity gauge, task checklists (create, edit, complete, reopen, delete), related AI workflows, initiative audit log |
| `/workflows` | AI Workflow Pipelines | Workflow cards, execution metrics (runs, success rate, latency), status filters, trigger filters, duplicate workflow, instant run |
| `/workflows/:id` | Visual Editor & Runner | Step-based sequencer (Input, Transform, Condition, Delay, Mock API, Output), step reordering, configuration modal, live terminal execution logs, JSON import/export |
| `/analytics` | System Telemetry | Date-range filters (7d, 30d, 90d), throughput trends, success vs failure comparison, exception breakdown, workflow rankings, RFC 4180 CSV export |
| `/activity` | Audit Trail & Event Log | Chronological timeline of executions, commits, milestones, filterable by event type and actor with incremental loading |
| `/team` | Workspace Access | Contributor list, fine-grained access roles (Owner, Admin, Member, Viewer), demo member invitation modal, role change, member removal |
| `/settings` | Workspace Configuration | User profile editor, theme customization (Dark Command Mode vs Light Contrast Mode with persistent CSS tokens), workspace details, notification channels, data backup JSON export, reset to initial demo data |
| `/notifications` | Notifications Center | Categorized alerts (Workflow, Project, Security, Team, System), filter by read/unread, mark as read, mark all read, target resource deep linking |
| `*` | 404 Route Not Found | Branded error screen with return to dashboard and deep navigation shortcuts |

---

## 4. Architectural Highlights & Domain Separation

1. **Deterministic Workflow Execution Engine (`src/engine/workflowEngine.ts`)**:
   - Supports 6 step types: `input`, `transform` (uppercase, lowercase, json_parse, json_stringify, regex_extract, ai_summarize), `condition` (truthy, equals, contains, greater_than, less_than), `delay` (with cancellation), `mock_api` (simulated latency and status codes), and `output` (template interpolation).
   - Live progression hooks pass step logs (`inputData`, `outputData`, `durationMs`, `status`, `error`) to UI in real time.
   - Clean abort mechanism via `AbortController` / `AbortSignal`.

2. **Global Omnisearch & Command Palette (`Ctrl+K`)**:
   - Keyboard accessible modal listening for `Ctrl+K` or `Cmd+K`.
   - Traps focus and allows arrow key navigation (`ArrowUp` / `ArrowDown`), `Enter` to execute/navigate, and `Escape` to close.
   - Searches across application routes, projects, workflows, and quick actions.

3. **Deterministic Persistence & Safe Recovery (`src/context/AppDataContext.tsx`)**:
   - Persists all state changes to browser `localStorage` under distinct keys (`nexus_projects`, `nexus_workflows`, etc.).
   - Includes graceful fallbacks to comprehensive seed data if storage is corrupted or empty.
   - Provides a 1-click **Reset Demo Data** function with confirmation dialog to restore initial baseline.

4. **Accessibility (WCAG 2.2 AA Compliance)**:
   - Visible keyboard focus rings (`:focus-visible: outline: 2px solid var(--color-accent)`).
   - High text contrast across dark and light palettes.
   - Screen reader data alternatives (`<table className="sr-only">`) under all SVG charts.
   - Non-color status indicators (icons, text labels, and pulse dots).
   - Reduced motion queries (`@media (prefers-reduced-motion: reduce)`) respected in CSS.

---

## 5. Verification & Automated Test Results

- **Unit Test Runner**: `vitest run`
  - Total test files: **2 passed** (`workflowEngine.test.ts`, `dataUtils.test.ts`)
  - Total tests executed: **11 passed (11/11)**
  - Tests verify:
    - Step execution for all transform, condition, and mock API types
    - End-to-end multi-step workflow pipeline execution
    - Graceful error boundary containment during simulated 500 API responses
    - Workflow cancellation via `AbortSignal`
    - RFC 4180 compliant CSV escaping and export generation
    - Project status and owner filtering algorithms
    - Progress and date sorting
    - Deterministic seed data invariants (8+ projects, 12+ workflows)
- **TypeScript & Production Build**: `tsc && vite build`
  - Output: `dist/index.html` (1.11 kB), `dist/assets/index.css` (34.95 kB), `dist/assets/index.js` (428.49 kB gzip: 112.51 kB).
  - Built with **0 errors and 0 warnings**.
- **Browser Automation Subagent**:
  - Live session recorded to: `nexus_verification.webp`
  - Verified Dashboard, Project creation, Task completion, Workflow detail & runner, Analytics CSV export, Theme toggle, and 404 page handling.

---

## 6. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18.0.0 or higher, tested on Node v22.13.1)
- npm (v9.0.0 or higher)

### Commands
```bash
# Navigate to project directory
cd nexus-ai-command-center

# Install dependencies
npm.cmd install

# Run automated unit test suite
npm.cmd test

# Build production bundle
npm.cmd run build

# Start local development server
npm.cmd run dev
```

The application will be accessible at:
👉 **`http://localhost:5173/`**
