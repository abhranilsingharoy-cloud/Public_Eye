# PublicEye — Hyperlocal Civic Issue Reporting & Resolution Platform

**PublicEye** (formerly *Community Hero*) is an autonomous, high-integrity civic-issue reporting and resolution platform designed for the **Valencia-Dolores** district. It empowers citizens to report, verify, track, and collaborate on local infrastructure issues (potholes, water leaks, streetlights, illegal dumping, etc.) using a fully grounded multi-agent cognitive architecture powered by Google's Gemini models.

---

## 🚀 Key Features

- **Hyperlocal District Map**: Interactive geolocation and auditing of active infrastructure hazards.
- **AI Predictive Hotspots**: Advanced density clustering and hot-spot forecasting powered by Gemini.
- **Civic AI Coprocessor**: Conversational chat interface grounded in active district data to file reports, draft letters to city officials, or check leaderboard statistics.
- **District Leaderboard & Metrics**: Interactive gamified reputation engine with automated points multipliers for reporting, voting, and providing verified proof of resolution.
- **Google Workspace Integration**: Automated Google Calendar auditing initiatives, municipal contact exports via Google Sheets, and email dispatch briefs via Gmail.
- **Autonomous Multi-Agent Pipeline**: Documented agent-to-agent transactions that verify, dispatch, escalate, and approve municipal repairs using comparative multimodal computer vision.

---

## 🤖 Multi-Agent Pipeline Architecture

PublicEye implements a self-correcting 7-Agent cognitive pipeline to manage the lifecycle of citizen complaints with high trust:

```
 Citizen Report
      │
      ▼
┌──────────────┐
│   Agent 1    │ ──► Multimodal Category, Severity & Safety Advisory
└──────────────┘
      │
      ▼
┌──────────────┐
│   Agent 2    │ ──► Multi-Modal Embeddings Semantic De-duplication Scan
└──────────────┘
      │
      ▼
┌──────────────┐
│   Agent 3    │ ──► Community Reputation Score & Anti-Spam Verification Filter
└──────────────┘
      │
      ▼
┌──────────────┐
│   Agent 4    │ ──► Google Maps Grounded Jurisdictional Ward Routing & SLA
└──────────────┘
      │
      ▼
┌──────────────┐
│   Agent 5    │ ──► SLA Tracker & Auto-Escalation Loop (Boost priority / notify council)
└──────────────┘
      │
      ▼
┌──────────────┐
│   Agent 6    │ ──► comparative Multimodal Vision Proof-of-Resolution Auditor
└──────────────┘
      │
      ▼
┌──────────────┐
│   Agent 7    │ ──► Conversational Copilot & Tool Calling Assistant
└──────────────┘
```

### The 7 Autonomous Agents:
1. **Intake & Vision Agent**: Categorizes reports, calculates severity (1-5), and generates citizen safety instructions.
2. **Duplicate & Cluster Agent**: Runs vector database similarity searches using multimodal embeddings to identify and group duplicate complaints within 50 meters.
3. **Verification & Trust Agent**: Reviews community verification inputs, upvotes, and individual user trust metrics to validate entries.
4. **Routing & Dispatch Agent**: Maps reports to jurisdictional municipal boundaries, drafts work orders, and assigns SLAs.
5. **Escalation & SLA Agent**: Runs background sweeps to detect SLA breaches and auto-escalate stagnant tickets.
6. **Resolution Verification Agent**: Compares before/after image pairs using multimodal computer vision to certify physical hazard clearing.
7. **Citizen Assistant Agent**: Provides friendly natural language guidance, drafts emails, and calls tools based on the district data state.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Motion (animations), Lucide Icons, Recharts (predictive dashboards).
- **Backend**: Express (NodeJS), file-based persistent transactional log (`issues.json`).
- **AI Engine**: `@google/genai` TypeScript SDK with strict JSON schemas (`gemini-3.5-flash`).
- **Geospatial**: Custom interactive canvas mapping with reverse geocoding and vector pin plotting.
- **Integrations**: Google Workspace mock pipeline interfaces (Sheets, Calendar, Gmail).

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (use `.env.example` as a template):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:3000`.*

---

## 🏆 Crafted for Judges & Citizens
Every reported issue is transparently logs a chronological trace of multi-agent handoffs under the **Agentic Execution Trace** in the issue detail view. Explore the **AI Agent Pipeline** tab in the main header for a complete interactive diagram of the platform's cognitive architecture and gamification guidelines!
