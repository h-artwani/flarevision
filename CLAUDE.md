# FlareVision

AI-powered fire and smoke detection platform using Claude vision and Temporal workflows.

## Stack

- **Monorepo**: Turborepo with npm workspaces
- **Web**: Next.js 15, Tailwind CSS, TypeScript (React 19)
- **Worker**: Node.js, TypeScript, Temporal (workflows + activities), Anthropic Claude SDK
- **Shared**: Zod schemas and TypeScript types

## Folder Structure

```
flarevision/
├── apps/
│   ├── web/               # Next.js 15 frontend
│   │   └── src/app/       # App Router pages and layouts
│   └── worker/            # Temporal worker process
│       └── src/
│           ├── index.ts       # Worker entry point
│           ├── workflows.ts   # Temporal workflow definitions
│           └── activities.ts  # Temporal activities (Claude API calls)
├── packages/
│   └── shared-types/      # Shared Zod schemas and TypeScript types
│       └── src/
│           ├── schemas.ts     # Zod validation schemas
│           ├── types.ts       # Inferred TypeScript types
│           └── index.ts       # Package exports
├── turbo.json             # Turborepo pipeline config
├── tsconfig.json          # Root TypeScript config
└── package.json           # Workspace root
```

## Key Packages

| Package | Name |
|---|---|
| Web app | `@flarevision/web` |
| Worker | `@flarevision/worker` |
| Shared types | `@flarevision/shared-types` |

## Environment Variables

### apps/worker
```
TEMPORAL_ADDRESS=localhost:7233
ANTHROPIC_API_KEY=sk-ant-...
```

## Development

```bash
# Install all dependencies
npm install

# Run all apps in dev mode
npm run dev

# Build all packages
npm run build

# Type check everything
npm run type-check
```

## Temporal

The worker connects to a local Temporal server on `localhost:7233` by default.
Task queue: `flarevision-analysis`

Workflow: `analyzeVideoWorkflow` — accepts an `AnalysisRequest`, calls Claude to detect fire/smoke, returns an `AnalysisResult`.
