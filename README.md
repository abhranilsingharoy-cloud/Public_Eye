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
  [![AI Core](https://img.shields.io/badge/AI_Engine-Gemini--Flash-orange.svg)](#)
  [![License](https://img.shields.io/badge/security-hardened-success.svg)](#)
</div>

---

## 📖 Executive Summary

**PublicEye** is an enterprise-grade civic technology platform designed to transform traditional, high-overhead 311 municipal reporting systems into a decentralized, self-governing physical-audit network. Built specifically for modern urban environments, PublicEye introduces peer-to-peer auditing consensus coupled with machine-learning-driven predictive analytics to discover, verify, escalate, and resolve local physical infrastructure failures (e.g., structural cracks, electrical exposure, hazardous leaks, and public lighting disruptions) without middleman friction.

Additionally, PublicEye integrates a mission-critical **Women's SafeGuard Hub**—an emergency response feature that allows citizens to broadcast distress signals directly to local precincts and NGOs, fully synchronized with Google Workspace and municipal dashboards.

---

## 🚀 Key Features

*   **Hyperlocal Issue Tracking:** Interactive maps powered by advanced clustering algorithms, allowing citizens to drop pins, upload evidentiary photos/videos, and log detailed structural failure notes.
*   **Decentralized Peer Consensus (Ledger):** Issues are only dispatched when independently verified by local "Auditors." Gamified XP systems promote active civic engagement and discourage spam.
*   **Women's SafeGuard Portal:** High-priority SOS broadcast relay routing instantly to verified NGO shelters, police response networks, and civic authorities.
*   **AI Predictive Hotspots:** Leverages Google Gemini APIs to ingest environmental and historical data (e.g. soil compaction, storm surges) to predict infrastructure failure *before* it occurs.
*   **Civic Copilot:** A robust conversational AI agent embedded directly in the platform to assist users with writing dispatch notes, querying SLA violations, and navigating city ordinances.
*   **Modular Node.js Backend:** High-performance, scalable API micro-routing design ensures fast data retrieval and separation of concerns for issues, stats, AI, and SafeGuard logic.

---

## 📐 Visual Architecture & Pipeline

PublicEye functions as a highly integrated cyber-physical system orchestrating real-time database transitions, GIS layouts, user-reputation weights, and LLM-assisted verification chains.

```mermaid
graph TD
    %% Styling
    classDef user fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef agent fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef db fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef external fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;

    %% Nodes
    A([Citizen / Auditor Mobile App]):::user
    B[API Gateway / Node.js Express]
    C[(PostgreSQL / Drizzle ORM)]:::db
    D{Gemini ML Routing Matrix}:::agent
    
    E[Agent 1: Classifier & Severity]:::agent
    F[Agent 2: Spatial Deduplicator]:::agent
    G[Agent 3: SLA Router]:::agent
    
    H[SafeGuard SOS Network]:::external
    I[Municipal Dispatch Workspace]:::external
    J[Live Ledger & Stats Dashboard]:::user

    %% Flow
    A -- "Submits Geo-Tagged Report" --> B
    A -- "Triggers Panic SOS" --> H
    
    B -- "Logs Incident Data" --> C
    B -- "Triggers AI Pipeline" --> D
    
    D --> E
    E -- "Priority Level (1-5)" --> F
    F -- "Radius Merge Check" --> G
    
    G -- "Approved Dispatch" --> I
    G -- "Updates Status" --> C
    
    C -- "Real-time Metrics" --> J
```

---

## 🧠 Machine Learning & Predictive Pipeline

The backbone of PublicEye's autonomy is its robust **Machine Learning Pipeline**, heavily relying on the **Google Gemini 2.0 Flash** multimodal architecture.

### 1. NLP Intake & Sentiment Analysis
When an incident is reported, it bypasses human dispatchers. The LLM extracts contextual entities (e.g., "water gushing", "deep crack", "sparking wire"). It runs a sentiment cross-check against historical data to classify urgency immediately. For example, "water leak" combined with "smells like gas" immediately flags a Level-1 Critical severity.

### 2. Predictive Diagnostics (Hotspots)
PublicEye isn't just reactive. It runs an asynchronous chron job through a spatial neural cluster.
*   **Input Features:** Weather forecast APIs (heavy rain predictions), street age data, traffic density, and past incident clusters.
*   **Output Vectors:** The ML model generates a `probability_score` for infrastructural failures (e.g., sinkholes or pipe bursts).
*   **Visualization:** These tensors are mapped via `@vis.gl/react-google-maps` using weighted heatmap arrays, allowing municipal trucks to preemptively inspect zones glowing "red" before disasters happen.

### 3. Visual Media Verification (Computer Vision)
Instead of manually sifting through resolution photos, PublicEye leverages Gemini's vision-language models. When a repair crew uploads a photo claiming "Pothole Fixed," the model analyzes the before-and-after image matrices. If it detects unpaved edges or poor structural integrity in the "after" photo, it flags the ticket for manual peer review rather than closing the SLA.

---

## 📂 Codebase & Directory Structure

The project has been aggressively refactored to support enterprise scale. The Node.js Express backend uses a modular routing schema alongside a blazingly fast React frontend built with Vite.

```text
Public_Eye/
├── server.ts                       # Lean Express Application Entrypoint
├── package.json                    # Dependencies & Scripts
├── firebase-applet-config.json     # Encrypted Firebase Credential Stub
├── src/
│   ├── routes/                     # Modular API Endpoints
│   │   ├── aiRoutes.ts             # Gemini & Predictive Networking
│   │   ├── issuesRoutes.ts         # Issue CRUD & Peer Voting
│   │   ├── safeguardRoutes.ts      # Emergency SOS & SafeGuard API
│   │   └── statsRoutes.ts          # Civic Leaderboard Aggregations
│   ├── services/
│   │   └── aiService.ts            # Google Gemini AI Initialization & Prompts
│   ├── db/                         # Drizzle ORM / Database Models
│   │   ├── index.ts                # DB connection pooling
│   │   ├── issues_db.ts            # Issue operations
│   │   └── safeguard_db.ts         # Emergency SOS logs
│   ├── components/                 # React UI Components
│   │   ├── Map.tsx                 # Core GIS interface
│   │   ├── SafeGuardHub.tsx        # SOS Interface
│   │   ├── CivicAssistant.tsx      # AI Chat Copilot
│   │   └── AgentPipeline.tsx       # Diagnostics Visualizer
│   ├── App.tsx                     # Main React Application State Manager
│   ├── main.tsx                    # React DOM Entrypoint
│   └── index.css                   # Tailwind CSS Configurations
├── public/
│   ├── robots.txt                  # Search Engine Directives
│   └── sitemap.xml                 # SEO Architecture Map
└── dist/                           # Production Bundles (Generated via Build)
```

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS | High-performance, highly reactive SPA architecture. |
| **Backend** | Node.js, Express | Modular routing layer for fast HTTP JSON API coordination. |
| **Database** | PostgreSQL, Drizzle ORM | Type-safe, scalable relational data storage and schema management. |
| **AI Integration** | Google Gemini 2.0 Flash | Drives Predictive Diagnostics, severity parsing, and the Civic Copilot. |
| **Map Rendering** | @vis.gl/react-google-maps | Renders high-fidelity neighborhood boundaries and issue heatmaps. |

---

## 💻 Local Development Setup

To run PublicEye locally and contribute to the civic tech ecosystem:

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **npm** (v10+)
- **PostgreSQL** (running locally or via cloud URL)

### 2. Environment Variables
Copy `.env.example` to a new `.env` file and populate the necessary keys:
```bash
cp .env.example .env
```
Ensure you have a valid `GEMINI_API_KEY` for the AI functionalities and a `DATABASE_URL` pointing to your Postgres instance.

### 3. Installation
Install the required packages across both the client and server:
```bash
npm install
```

### 4. Running the Development Server
Start the development server. This utilizes Vite in middleware mode alongside Express to seamlessly compile your React components on the fly:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the PublicEye interface.

### 5. Production Build
To test the production asset bundling and compile the server cleanly via ESBuild:
```bash
npm run build
npm start
```

---

## 🛡️ Security & Privacy

PublicEye utilizes rigorous obfuscation for civilian identities. Emergency SOS requests triggered via the SafeGuard Hub are encrypted and routed strictly via TLS-verified channels. The public audit ledger obscures direct PII while validating geo-spatial proximity using one-way cryptographic hashing techniques.

## 🤝 Contributing

We welcome civic hackers, municipal IT staff, and AI enthusiasts.
1. Fork the repository
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
*Developed with purpose by the PublicEye Citizen Alliance.*
