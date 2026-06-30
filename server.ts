import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { seedIssuesIfEmpty } from './src/db/issues_db.ts';

import issuesRoutes from './src/routes/issuesRoutes.ts';
import safeguardRoutes from './src/routes/safeguardRoutes.ts';
import aiRoutes from './src/routes/aiRoutes.ts';
import statsRoutes from './src/routes/statsRoutes.ts';

dotenv.config();

// Seed database
seedIssuesIfEmpty();

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');

app.use(express.json());

// Ensure data directory exists (for any legacy fallback files if needed)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Register API Routes
app.use('/api/issues', issuesRoutes);
app.use('/api/safeguard', safeguardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', aiRoutes);

// Vite middleware for development or serving index.html in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
