# Strype Analytics — Instrumented Frame-Based Coding Workspace

A mini prototype demonstrating front-end instrumentation, backend telemetry collection, and an analytics dashboard for a frame-based code editor, built as a technical demo for the Strype research project at King's College London.

## What This Demonstrates

This project addresses the core task described in the Strype Web Programmer role: instrumenting an online educational IDE to collect detailed usage data, including front-end instrumentation, a backend server, and a user dashboard.

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Vue 3 + TypeScript Frontend                    │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Frame Editor  │  │ Analytics Dashboard    │   │
│  │ (5 frame types)│  │ (metrics, charts,     │   │
│  │               │  │  event timeline)       │   │
│  └──────┬───────┘  └────────────┬───────────┘   │
│         │                       │                │
│  ┌──────┴───────────────────────┴───────────┐   │
│  │  useInstrumentation() composable          │   │
│  │  - Event buffering (5s flush interval)    │   │
│  │  - Typed event schema                     │   │
│  │  - sendBeacon on page unload              │   │
│  └──────────────────┬───────────────────────┘   │
└─────────────────────┼───────────────────────────┘
                      │ POST /api/events
                      │ GET /api/dashboard/summary
┌─────────────────────┼───────────────────────────┐
│  Express + TypeScript Backend                    │
│  ┌──────────────────┴───────────────────────┐   │
│  │  REST API                                 │   │
│  │  - POST /api/events (batch insert)        │   │
│  │  - GET /api/events                        │   │
│  │  - GET /api/dashboard/summary             │   │
│  └──────────────────┬───────────────────────┘   │
│  ┌──────────────────┴───────────────────────┐   │
│  │  SQLite (WAL mode)                        │   │
│  │  - Indexed on session_id, event_name,     │   │
│  │    timestamp                              │   │
│  │  - Transaction-based batch inserts        │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Stack (aligned with Strype)

| Layer    | Technology                  | Why                                         |
|----------|-----------------------------|---------------------------------------------|
| Frontend | Vue 3 + TypeScript + Vite   | Matches Strype's actual stack               |
| Backend  | Express + TypeScript        | Single language across the project           |
| Database | SQLite (better-sqlite3)     | Zero config, fast, embeddable               |
| Styling  | CSS custom properties       | Clean, maintainable, no build dependencies  |

### Instrumented Events

| Event               | Captured Data                          |
|---------------------|----------------------------------------|
| session_started     | sessionId, userId, projectId           |
| session_ended       | sessionId, duration                    |
| frame_added         | frameId, frameType                     |
| frame_deleted       | frameId, frameType                     |
| frame_edited        | frameId, frameType (debounced 300ms)   |
| frame_moved         | frameId, direction                     |
| program_run_clicked | frameCount                             |
| program_saved       | frameCount, editCount                  |
| error_shown         | errorType, frameId                     |
| dashboard_viewed    | -                                      |

### Frame Types (matching Strype terminology)

- **funccall** (print) — Function call frame
- **if** — Conditional frame
- **for** — Loop frame
- **varassign** — Variable assignment frame
- **comment** — Comment frame

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Install all dependencies
cd client && npm install
cd ../server && npm install
cd ..

# Or with the root convenience script:
npm install
npm run install:all
```

### Development

Terminal 1 — Start backend:
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

Terminal 2 — Start frontend:
```bash
cd client
npm run dev
# App runs on http://localhost:5173
# API requests proxied to :3001
```

### Usage

1. Open http://localhost:5173
2. Click frame types in the left palette to add frames
3. Edit fields, reorder, and delete frames
4. Click "Run" or "Save" to trigger those events
5. Navigate to Dashboard to see analytics

## Deployment

### Frontend (Netlify)

```bash
cd client
npm run build
# Deploy the dist/ folder to Netlify
```

Add a `client/_redirects` file for SPA routing:
```
/*    /index.html   200
```

### Backend (Railway / Render / Fly.io)

```bash
cd server
npm run build
npm start
```

Set the `PORT` environment variable if needed. Update the frontend's API base URL to point to the deployed backend.

## Research Context

This instrumentation is designed to help answer programming-education research questions:

- **Where do learners hesitate?** — Edit frequency and duration per frame type
- **Which constructs are used most?** — Frame type usage distribution
- **How many edits before running?** — Edit-to-run ratio indicates confidence
- **Do certain frames cause confusion?** — Error rates by frame type
- **Does structured editing reduce syntax mistakes?** — Compare error patterns

These align directly with the Strype team's research on frame-based editing for novice programmers, examining the transition from block-based to text-based programming.

## Project Structure

```
strype-analytics/
├── client/                     # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── EditorView.vue      # Main frame editor
│   │   │   ├── FrameBlock.vue      # Individual frame component
│   │   │   └── DashboardView.vue   # Analytics dashboard
│   │   ├── composables/
│   │   │   └── useInstrumentation.ts  # Event tracking engine
│   │   ├── types/
│   │   │   └── events.ts           # Shared type definitions
│   │   ├── assets/
│   │   │   └── main.css            # Design system
│   │   ├── App.vue                 # Root component
│   │   └── main.ts                 # App entry
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                     # Express backend
│   ├── src/
│   │   ├── index.ts               # Server entry + routes
│   │   ├── db.ts                  # SQLite database layer
│   │   └── types.ts               # Shared type definitions
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## Author

Built by Deepak Singh Sengar as a technical demonstration for the Strype Web Programmer position at King's College London, supervised by Michael Kolling and Neil Brown.
