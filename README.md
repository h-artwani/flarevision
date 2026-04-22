# ⚡ FlareVision

> **AI-powered incident response orchestrator** — from alert to root cause analysis in under 5 minutes, without a human digging through logs at 3am.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Temporal](https://img.shields.io/badge/Temporal-1.10-000000?style=flat-square&logo=temporal&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-claude--sonnet--4--6-D97706?style=flat-square)
![Turborepo](https://img.shields.io/badge/Turborepo-2.0-EF4444?style=flat-square&logo=turborepo&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)

---

## What is FlareVision?

When a production alert fires, FlareVision automatically spins up a **durable Temporal workflow** that chains **4 Claude AI agents** together — triaging the alert, analyzing logs, correlating recent deployments, and synthesizing a full Root Cause Analysis report.

No runbooks. No 3am log spelunking. Just answers.

---

## Demo

https://github.com/h-artwani/flarevision/blob/main/flarevision-demo.mov

---

## 🏗️ Architecture

```
                         ┌─────────────────────────────────────────┐
                         │           Temporal Workflow              │
                         │                                          │
 Alert Trigger  ──────►  │   ┌──────────────────────────────────┐  │
                         │   │       Promise.all (parallel)      │  │
                         │   │                                   │  │
                         │   │  🔍 triageAlertActivity           │  │
                         │   │  📋 analyzeLogsActivity           │  │  ──────►  📄 RCA Report
                         │   │  🚀 correlateDeployActivity       │  │
                         │   │                                   │  │
                         │   └──────────────┬───────────────────┘  │
                         │                  │                       │
                         │                  ▼                       │
                         │       🧠 generateRCAActivity             │
                         │                                          │
                         └─────────────────────────────────────────┘
```

The three investigation agents run **in parallel**, then hand off their findings to the RCA agent which synthesizes a complete incident report — all durable, retryable, and inspectable in the Temporal UI.

---

## 🤖 The 4 AI Agents

All agents live in [`apps/worker/src/activities.ts`](apps/worker/src/activities.ts) and call the Claude API with Zod-validated structured outputs.

| Agent | What it does |
|---|---|
| `triageAlertActivity` | Classifies severity (P1/P2/P3), identifies the affected service, and estimates blast radius |
| `analyzeLogsActivity` | Identifies anomalies, counts frequency, timestamps first occurrence, and surfaces correlations |
| `correlateDeployActivity` | Checks whether a recent deploy caused the incident and which files changed |
| `generateRCAActivity` | Synthesizes all three findings into a structured root cause analysis with a remediation plan |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Language** | TypeScript 5.4 | End-to-end type safety across all layers |
| **Orchestration** | Temporal | Durable workflows with automatic retries and full execution history |
| **AI** | Claude API (`claude-sonnet-4-6`) | Structured reasoning across all 4 agents |
| **Validation** | Zod | Runtime validation of every Claude API response |
| **Frontend** | Next.js 15 | Dashboard with live workflow visualizer *(in progress)* |
| **Monorepo** | Turborepo | Parallel builds and shared packages |

---

## 📁 Project Structure

```
flarevision/
├── apps/
│   ├── web/                  # Next.js 15 frontend dashboard (in progress)
│   └── worker/               # Temporal worker — all 4 AI agents live here
│       └── src/
│           ├── index.ts          # Worker entry point
│           ├── workflows.ts      # Temporal workflow definition
│           ├── activities.ts     # The 4 Claude AI agents
│           └── test-workflow.ts  # Local trigger script
└── packages/
    └── shared-types/         # Zod schemas + TypeScript types shared across apps
        └── src/
            ├── schemas.ts        # AlertPayload, TriageResult, RCAReport, ...
            └── types.ts          # Inferred TypeScript types
```

---

## 🚀 Running Locally

**Prerequisites:** Node.js 20+, Docker Desktop, [Temporal CLI](https://docs.temporal.io/cli)

```bash
# 1. Clone and install
git clone https://github.com/your-username/flarevision.git
cd flarevision
npm install

# 2. Add your Anthropic API key
echo "ANTHROPIC_API_KEY=your-key-here" > apps/worker/.env

# 3. Start Temporal (in a separate terminal)
temporal server start-dev

# 4. Start the worker (in a separate terminal)
cd apps/worker
npm run dev

# 5. Trigger a test workflow
npm run test:workflow

# 6. Inspect the workflow execution
open http://localhost:8233
```

The Temporal UI at `localhost:8233` shows the full execution history, activity inputs/outputs, and retry state for every workflow run.

---

## ✅ Status

- [x] Monorepo scaffold with Turborepo
- [x] Shared Zod schemas and TypeScript types
- [x] 4 Claude AI agents with validated structured outputs
- [x] End-to-end Temporal workflow running locally
- [x] Next.js API routes
- [x] React dashboard with live workflow visualizer
- [x] Deployed to Temporal Cloud + Railway

---

## 📄 License

MIT
