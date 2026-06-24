# PublicEye — Autonomous Hyperlocal Civic Auditing & Predictive Diagnostics

<div align="center">
  <br />
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120" style="background: transparent;">
    <style>
      @keyframes blink {
        0%, 88%, 93%, 100% { transform: scaleY(1); opacity: 1; filter: drop-shadow(0 0 4px #22c55e); }
        90%, 92% { transform: scaleY(0.05); opacity: 0.25; filter: drop-shadow(0 0 0px transparent); }
      }
      .eyeball {
        transform-origin: 50px 50px;
        animation: blink 3.5s ease-in-out infinite;
      }
    </style>
    <!-- Toxic Diamond Frame -->
    <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="rgba(34, 197, 94, 0.08)" stroke="#22c55e" stroke-width="2.5" stroke-linejoin="round" />
    
    <!-- Blinking Eye Inner Icon -->
    <g class="eyeball">
      <!-- Eye Contour -->
      <path d="M 23 50 C 35 25 65 25 77 50 C 65 75 35 75 23 50 Z" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Pupil -->
      <circle cx="50" cy="50" r="10" fill="none" stroke="#4ade80" stroke-width="3" />
      <circle cx="50" cy="50" r="4.5" fill="#4ade80" />
    </g>
  </svg>
  <h2>PublicEye System</h2>
  <p><em>Next-Generation Distributed Civic Infrastructure Verification, Predictive Diagnostics, and Autonomous Dispatch</em></p>
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
  [![Platform](https://img.shields.io/badge/platform-React%20%7C%20Node%20%7C%20Vite-blue.svg)](#)
  [![AI Core](https://img.shields.io/badge/AI_Engine-Gemini--3.5--Flash-orange.svg)](#)
  [![License](https://img.shields.io/badge/security-hardened-success.svg)](#)
</div>

---

## 📖 Executive Summary

**PublicEye** is an enterprise-grade civic technology platform designed to transform traditional, high-overhead 311 municipal reporting systems into a decentralized, self-governing physical-audit network. Built specifically for the **Valencia-Dolores** municipal district, PublicEye introduces peer-to-peer auditing consensus coupled with machine-learning-driven predictive analytics to discover, verify, escalate, and resolve local physical infrastructure failures (e.g., structural cracks, electrical exposure, hazardous leaks, and public lighting disruptions) without middleman friction.

Through a multi-agent routing, clustering, and deduplication logic, PublicEye matches human reporting with deep LLM classification and automated verification, rewarding active field inspectors on a public gamified leaderboard.

---

## 📐 Systems Architecture & Pipeline

PublicEye functions as a highly integrated cyber-physical system orchestrating real-time database transitions, GIS layouts, user-reputation weights, and LLM-assisted verification chains.

### 🔄 Multi-Agent Verification & SLA Lifecycle

```
[ Citizen Report Filed ]
         │ (Includes Title, Category, Coordinates, Media Captures)
         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent 1: Intake, Classification & Severity Index    │ ──► Assigns initial severity (1-5), generates safe advisories
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent 2: Geospatial & Semantic De-duplication       │ ──► Maps vectors; groups duplicate reports within 50 meters
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent 3: Reputation & Anti-Spam Trust Filter        │ ──► Multiplier calculations based on voter historical scores
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent 4: Jurisdictional Dispatch Router            │ ──► Matches GIS polygons; assigns SLA & drafts dispatch orders
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent 5: Automated SLA & Escalation Sweeper         │ ──► Monitors timeline; fires alerts for missed target resolutions
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent 6: Multi-Photo Resolution Verifier            │ ──► Analyzes before/after media matrices to authorize closure
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent 7: Grounded Natural Language Civic Assistant  │ ──► Grounded in active state; drafts letters & triggers APIs
└────────────────────────────────────────────────────────┘
```

---

## 📂 Codebase & Directory Structure

This project adopts a highly structured modular layout, cleanly splitting static client presentation from persistent API services and deep utility modules.

```
/ (Workspace Root)
├── .env.example                      # Blueprint for environment variables & API tokens
├── .gitignore                        # Standard exclusion rule list (Node modules, local artifacts)
├── README.md                         # Detailed system technical documentation
├── package.json                      # Build script pipelines and dependency declarations
├── tsconfig.json                     # System compiler directives & path mapping configurations
├── vite.config.ts                    # Build bundler configuration for Vite
├── server.ts                         # Custom high-speed Express API backend server
├── firebase-applet-config.json       # Config mappings for Firebase Firestore & Auth integration
├── metadata.json                     # Sandbox context, permissions (geolocation, camera), capabilities
│
└── src/                              # Client Application Source Code
    ├── main.tsx                      # SPA entry point
    ├── index.css                     # Global styles, Tailwind imports, and font injections
    ├── types.ts                      # Strict TypeScript interface and type contracts
    ├── App.tsx                       # Orchestration layer, tab managers, and state controller
    │
    └── components/                   # Highly modular functional presentation units
        ├── Map.tsx                   # Mapbox-style Google Maps wrapper with pins, paths & tools
        ├── HeatmapLayer.tsx          # Real-time high-contrast hotspot visualization layer
        ├── MultiPhotoCapture.tsx     # Custom camera viewfinder capturing multiple concurrent proofs
        ├── IssueDetail.tsx           # Ticket inspector, verification histories, and chat feeds
        ├── PredictiveReport.tsx      # Density calculations, forecasting, and hazard trends
        ├── StatsLeaderboard.tsx      # Gamified civic audit stats and peer scoring indicators
        ├── WorkspaceHub.tsx          # Integration workspace (Google Sheets, Docs, Calendar, Gmail)
        ├── AgentPipeline.tsx         # Real-time visualization graph showing multi-agent operations
        ├── InteractiveLogo.tsx       # System brand identity module with custom animations
        ├── CameraMediaCapture.tsx    # Standard baseline camera / video feed component
        └── CivicAssistant.tsx        # conversational terminal sidebar grounded in district data
```

---

## ⚡ Core Advanced Features

### 1. High-Contrast Toggleable Heatmap Layer
* Located in `src/components/HeatmapLayer.tsx` and integrated seamlessly inside the standard `Map.tsx` view.
* Enables auditors to toggle dynamically between granular, color-coded category pins (**Standard View**) and a high-contrast density gradient map (**Heatmap View**).
* Uses real-time geographic coordinates to plot hot-spots of outstanding infrastructure failures, prioritizing high-density hazard areas.

### 2. Predictive Diagnostics & Local Relationship Engines
* Located in the `IssueDetail.tsx` inspector panel.
* Automatically uses the spherical Law of Cosines to fetch other active and resolved reports of the **same category** within the immediate vicinity.
* Highlights recurring system weaknesses (e.g., persistent water main failures along Calle de Dolores) to alert public maintenance teams of underlying root causes.

### 3. Multi-Photo Auditing Capture & Drag-Drop Fallback
* Implemented in `src/components/MultiPhotoCapture.tsx`.
* Allows active citizen inspectors to record multiple verification images in a single audit entry.
* Integrates native device cameras with immediate canvas frame-grabbing, while providing a drag-and-drop file uploading wrapper for maximum accessibility.

---

## 🛠️ Production Build & Run Scripts

Ensure you have a modern runtime environment active (`Node.js v18+` or higher).

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_google_gemini_api_key
VITE_GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_key
```

### 3. Start Development Server
```bash
npm run dev
```
*The application starts at `http://localhost:3000` with instant multi-agent operations.*

### 4. Run Production Compilation
```bash
npm run build
```
*Compiles frontend assets using Vite and bundles server.ts into a standalone CommonJS module in `dist/`.*

### 5. Launch Bundled Production App
```bash
npm start
```

---

<div align="center">
  <p className="font-mono text-slate-500 text-[10px] uppercase">
    Designed for absolute high performance and technical precision.
  </p>
</div>
