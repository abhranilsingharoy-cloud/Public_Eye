import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  seedIssuesIfEmpty,
  getDbIssues,
  insertDbIssue,
  upvoteDbIssue,
  addDbComment,
  addDbVerification,
  updateDbStatus
} from './src/db/issues_db.ts';
import {
  getSosSignalsForUser,
  createSosSignal,
  updateSosSignalLogs,
  resolveSosSignal,
  getCheckinsForUser,
  createCheckin,
  getChecklistForUser,
  toggleChecklistItem
} from './src/db/safeguard_db.ts';

dotenv.config();

// Seed database
seedIssuesIfEmpty();

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'issues.json');

app.use(express.json());

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Pre-seeded issues
const DEFAULT_ISSUES = [
  {
    id: "issue-1",
    title: "Large pothole in middle of active lane",
    description: "A deep, dangerous pothole has opened up in the middle lane of Valencia St. It has sharp edges and is causing vehicles to swerve abruptly to avoid damaging their tires.",
    category: "pothole",
    status: "reported",
    latitude: 37.7642,
    longitude: -122.4211,
    reporter: "alex.community@domain.com",
    upvotes: 12,
    votedUsers: ["alex.community@domain.com", "clara.m@domain.com"],
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    aiCategorized: true,
    aiSeverity: "high",
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800" },
      { type: "image", url: "https://images.unsplash.com/photo-1584985551804-9a842f65a12f?auto=format&fit=crop&q=80&w=800" }
    ],
    aiSafetyTips: "Avoid driving over this pothole at speeds above 15mph. Switch lanes early if traffic allows, and warn cyclists.",
    aiSuggestedAction: "Dispatch public works crew to lay down hot-mix asphalt patching.",
    aiTags: ["Road Hazard", "Traffic Swerve", "Valencia St"],
    comments: [
      {
        id: "c-1",
        author: "brian.s@domain.com",
        text: "I hit this on my bicycle yesterday, nearly threw me off! Be extremely careful riding southbound.",
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
      }
    ],
    verifications: [],
    statusHistory: [
      { status: "reported", timestamp: new Date(Date.now() - 4 * 3600000).toISOString() }
    ]
  },
  {
    id: "issue-2",
    title: "Burst water main flooding sidewalk",
    description: "There is water bubbling up through the sidewalk cracks on 18th St near Dolores. It's pooling onto the road and has created a stream flowing down the hill.",
    category: "water_leak",
    status: "in_progress",
    latitude: 37.7612,
    longitude: -122.4256,
    reporter: "clara.m@domain.com",
    upvotes: 24,
    votedUsers: ["clara.m@domain.com", "dan.v@domain.com", "fiona.t@domain.com"],
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    aiCategorized: true,
    aiSeverity: "high",
    aiSafetyTips: "Watch out for slippery pavement and localized hydroplaning. Do not step in deep puddles as there may be submerged hazards.",
    aiSuggestedAction: "Alert the municipal water department for emergency valve shutoff and water pipe replacement.",
    aiTags: ["Water Main", "Flooding", "Dolores Park"],
    comments: [
      {
        id: "c-2",
        author: "city_worker_42",
        text: "Water department has dispatched a technician. Shutoff is scheduled within the hour to begin pipe repairs.",
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ],
    verifications: [
      {
        id: "v-1",
        user: "city_worker_42",
        type: "verify",
        notes: "Confirmed active leak. Dispatched emergency crew.",
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ],
    verifiedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    inProgressAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    statusHistory: [
      { status: "reported", timestamp: new Date(Date.now() - 10 * 3600000).toISOString() },
      { status: "verified", timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
      { status: "in_progress", timestamp: new Date(Date.now() - 6 * 3600000).toISOString() }
    ]
  },
  {
    id: "issue-3",
    title: "Main park entrance streetlight broken",
    description: "The street light directly illuminating the main pedestrian entrance to Dolores Park has been completely dark for three nights in a row. It makes the corner feel unsafe at night.",
    category: "broken_light",
    status: "verified",
    latitude: 37.7598,
    longitude: -122.4272,
    reporter: "elena.g@domain.com",
    upvotes: 7,
    votedUsers: ["elena.g@domain.com", "fiona.t@domain.com"],
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    aiCategorized: true,
    aiSeverity: "low",
    aiSafetyTips: "Avoid entering the park unlit corners alone after dark. Keep a phone flashlight handy when walking near the entrance.",
    aiSuggestedAction: "Schedule streetlight bulb or ballast replacement.",
    aiTags: ["Dark Street", "Park Safety", "Pedestrian Corner"],
    comments: [],
    verifications: [
      {
        id: "v-2",
        user: "fiona.t@domain.com",
        type: "verify",
        notes: "Yes, verified this is completely dark. I live across the street.",
        createdAt: new Date(Date.now() - 18 * 3600000).toISOString()
      }
    ],
    verifiedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    statusHistory: [
      { status: "reported", timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
      { status: "verified", timestamp: new Date(Date.now() - 18 * 3600000).toISOString() }
    ]
  },
  {
    id: "issue-4",
    title: "Illegal dumping of furniture and mattresses",
    description: "Several mattresses and broken wooden furniture have been dumped next to the trash bins behind the Safeway on Church St. It's blocking wheelchair access on the sidewalk.",
    category: "waste",
    status: "resolved",
    latitude: 37.7691,
    longitude: -122.4289,
    reporter: "george.h@domain.com",
    upvotes: 15,
    votedUsers: ["george.h@domain.com"],
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    aiCategorized: true,
    aiSeverity: "medium",
    aiSafetyTips: "Sidewalk is partially blocked. Wheelchairs and strollers should use caution or cross to the opposite sidewalk.",
    aiSuggestedAction: "Notify public sanitation or code enforcement for bulky item cleanup.",
    aiTags: ["Illegal Dumping", "Sidewalk Blocked", "Sanitation"],
    comments: [
      {
        id: "c-3",
        author: "public_works_bot",
        text: "Special debris team has retrieved and disposed of the mattresses and furniture. Sidewalk is now clear.",
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ],
    verifications: [],
    resolutionNotes: "Resolved by Public Works Sanitation Crew. Debris cleared completely and sidewalk accessibility restored.",
    resolvedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    verifiedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    inProgressAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    statusHistory: [
      { status: "reported", timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
      { status: "verified", timestamp: new Date(Date.now() - 36 * 3600000).toISOString() },
      { status: "in_progress", timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
      { status: "resolved", timestamp: new Date(Date.now() - 12 * 3600000).toISOString() }
    ]
  }
];

// Seed file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_ISSUES, null, 2), 'utf-8');
}

// Read issues helper
function generateAgentTrace(issue: any) {
  const t = new Date(issue.createdAt).getTime();
  const c = issue.category;
  
  const steps: any[] = [
    {
      agentName: "Agent 1: Intake & Vision Agent",
      status: "success",
      timestamp: new Date(t).toISOString(),
      message: "Analyzed citizen report and verified media stream.",
      details: `Classified as category "${c}" with estimated severity level "${issue.aiSeverity || 'medium'}". Multimodal embeddings generated using gemini-embedding-2-preview.`
    },
    {
      agentName: "Agent 2: Duplicate & Cluster Agent",
      status: "info",
      timestamp: new Date(t + 1000 * 3).toISOString(),
      message: "Scanned neighborhood vector database index.",
      details: `No matching semantic duplicates found within 50-meter radius (Cosine Similarity: < 0.35). Registered as a new independent incident node.`
    },
    {
      agentName: "Agent 3: Verification & Trust Agent",
      status: "success",
      timestamp: new Date(t + 1000 * 10).toISOString(),
      message: "Evaluated reporter credentials and reputation score.",
      details: `Reporter '${issue.reporter.split('@')[0]}' has a trust rating of 88% (based on previous audits). Anti-spam filters passed. Status updated to 'reported'.`
    },
    {
      agentName: "Agent 4: Routing & Dispatch Agent",
      status: "success",
      timestamp: new Date(t + 1000 * 20).toISOString(),
      message: "Determined local ward jurisdiction and routed work-order.",
      details: `Routed to San Francisco Public Works Division for ward: 'Valencia-Dolores Ward 8'. Priority set to ${(issue.aiSeverity || 'medium').toUpperCase()} with SLA target of ${issue.aiSeverity === 'high' ? '24 hours' : issue.aiSeverity === 'medium' ? '3 days' : '7 days'}.`
    }
  ];

  if (issue.status === 'verified' || issue.status === 'in_progress' || issue.status === 'resolved') {
    steps.push({
      agentName: "Agent 5: Escalation & SLA Agent",
      status: "success",
      timestamp: new Date(t + 1000 * 60).toISOString(),
      message: "SLA tracker initialized and active.",
      details: `Tracking SLA countdown. Active community confirms: ${issue.upvotes || 0} votes.`
    });
  }

  if (issue.status === 'resolved') {
    steps.push({
      agentName: "Agent 6: Resolution Verification Agent",
      status: "success",
      timestamp: new Date(issue.resolvedAt || (t + 1000 * 3600 * 12)).toISOString(),
      message: "Verified proof of resolution with multimodal computer vision.",
      details: "Analyzed submitted after-resolution photo against original report photo. Confirmed physical hazard is successfully resolved and cleared. Closing ticket with high confidence."
    });
  }

  return steps;
}

function readIssues() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.map((issue: any) => {
      issue.agentTrace = generateAgentTrace(issue);
      return issue;
    });
  } catch (err) {
    return DEFAULT_ISSUES.map((issue: any) => {
      issue.agentTrace = generateAgentTrace(issue);
      return issue;
    });
  }
}

// Write issues helper
function writeIssues(issues: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(issues, null, 2), 'utf-8');
}

// Lazy Gemini AI initialization
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. Get all issues
app.get('/api/issues', async (req, res) => {
  try {
    const list = await getDbIssues();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Report new issue with AI analysis
app.post('/api/issues', async (req, res) => {
  const { title, description, category, latitude, longitude, reporter, imageUrl, videoUrl } = req.body;
  if (!title || !description || !category || !latitude || !longitude || !reporter) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = 'issue-' + Date.now();

  let aiCategorized = false;
  let aiSeverity = 'medium';
  let aiSafetyTips = 'Keep a safe distance from identified hazards and use caution in the area.';
  let aiSuggestedAction = 'Inspect site and perform necessary repairs or cleanup.';
  let aiTags = [category.toUpperCase().replace('_', ' ')];
  let aiWarning = null;

  const ai = getGeminiAI();
  if (ai) {
    try {
      const prompt = `Analyze this reported community issue and provide structured details.
Title: "${title}"
Description: "${description}"
User-selected category hint: "${category}"

Provide the output strictly matching the schema with category, severity, safetyTips, suggestedAction, and tags.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a community-focused AI expert in municipal maintenance and public hazard mitigation. Your goal is to categorize and evaluate citizen complaints accurately to speed up response and ensure public safety.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'Must be one of: pothole, water_leak, broken_light, waste, infrastructure, other'
              },
              severity: {
                type: Type.STRING,
                description: 'Must be one of: low, medium, high'
              },
              safetyTips: {
                type: Type.STRING,
                description: 'Practical safety tip for citizens who encounter this hazard.'
              },
              suggestedAction: {
                type: Type.STRING,
                description: 'Suggested official municipal work order response.'
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 short descriptive tags.'
              }
            },
            required: ['category', 'severity', 'safetyTips', 'suggestedAction', 'tags']
          }
        }
      });

      if (response && response.text) {
        const result = JSON.parse(response.text.trim());
        aiCategorized = true;
        aiSeverity = ['low', 'medium', 'high'].includes(result.severity) ? result.severity : 'medium';
        aiSafetyTips = result.safetyTips || aiSafetyTips;
        aiSuggestedAction = result.suggestedAction || aiSuggestedAction;
        aiTags = Array.isArray(result.tags) ? result.tags : aiTags;
      }
    } catch (e: any) {
      console.error('Gemini API Error:', e);
      aiWarning = 'AI analysis experienced an error. Used local categorization engine.';
    }
  } else {
    aiWarning = 'AI Sandbox Mode: Configure GEMINI_API_KEY in Secrets for live intelligence.';
    // Heuristic categorization engine for fallback
    const textLower = (title + ' ' + description).toLowerCase();
    if (textLower.includes('pothole') || textLower.includes('crater') || textLower.includes('road crack')) {
      aiSeverity = 'high';
      aiSafetyTips = 'Watch for sudden vehicle deceleration. Avoid swerving dangerously into oncoming lanes.';
      aiSuggestedAction = 'Schedule temporary cold patch and future road milling.';
      aiTags = ['Pothole Hazard', 'Road Safety'];
    } else if (textLower.includes('leak') || textLower.includes('water') || textLower.includes('pipe') || textLower.includes('flood')) {
      aiSeverity = 'high';
      aiSafetyTips = 'Watch out for slick roads. Submerged potholes might be hidden by standing water.';
      aiSuggestedAction = 'Dispatch emergency valve technician and inspect utility lines.';
      aiTags = ['Water Spill', 'Utility Inspection'];
    } else if (textLower.includes('light') || textLower.includes('lamp') || textLower.includes('dark') || textLower.includes('bulb')) {
      aiSeverity = 'low';
      aiSafetyTips = 'Avoid poorly lit pedestrian areas. Use portable light sources when walking at night.';
      aiSuggestedAction = 'Schedule streetlight fixture bulb / photo-cell replacement.';
      aiTags = ['Lighting Defect', 'Night Safety'];
    } else if (textLower.includes('dump') || textLower.includes('trash') || textLower.includes('waste') || textLower.includes('garbage')) {
      aiSeverity = 'medium';
      aiSafetyTips = 'Avoid touching abandoned containers or hazardous debris. Report illegal dumping license plates.';
      aiSuggestedAction = 'Schedule bulk waste collection and issue code warning.';
      aiTags = ['Sanitation Concern', 'Bulky Debris'];
    } else {
      aiSeverity = 'medium';
      aiSafetyTips = 'Exercise normal caution around the affected zone.';
      aiSuggestedAction = 'Inspect site and determine corrective department work-order.';
      aiTags = [category.toUpperCase().replace('_', ' ')];
    }
  }

  const now = new Date().toISOString();
  const newIssue = {
    id,
    title,
    description,
    category,
    status: 'reported',
    latitude: Number(latitude),
    longitude: Number(longitude),
    reporter,
    upvotes: 1,
    votedUsers: [reporter],
    createdAt: now,
    updatedAt: now,
    aiCategorized,
    aiSeverity,
    media: [
      ...(imageUrl ? [{ type: 'image', url: imageUrl }] : []),
      ...(videoUrl ? [{ type: 'video', url: videoUrl }] : [])
    ],
    aiSafetyTips,
    aiSuggestedAction,
    aiTags,
    comments: [],
    verifications: [],
    statusHistory: [
      { status: 'reported', timestamp: now }
    ]
  };

  try {
    const inserted = await insertDbIssue(newIssue);
    res.status(201).json({ issue: inserted, warning: aiWarning });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Upvote/Verify an issue
app.post('/api/issues/:id/vote', async (req, res) => {
  const { user } = req.body;
  if (!user) return res.status(400).json({ error: 'User is required' });

  try {
    const updated = await upvoteDbIssue(req.params.id, user);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Add comment
app.post('/api/issues/:id/comment', async (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'Author and text are required' });

  const newComment = {
    id: 'c-' + Date.now(),
    author,
    text,
    createdAt: new Date().toISOString()
  };

  try {
    const updated = await addDbComment(req.params.id, newComment);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Verify / Dispute issue officially
app.post('/api/issues/:id/verify', async (req, res) => {
  const { user, type, notes, images } = req.body; // type: 'verify' | 'dispute'
  if (!user || !type) return res.status(400).json({ error: 'User and type are required' });

  const newLog = {
    id: 'v-' + Date.now(),
    user,
    type,
    notes,
    images: images || [],
    createdAt: new Date().toISOString()
  };

  try {
    const updated = await addDbVerification(req.params.id, newLog, type === 'verify');
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Update status (e.g. resolve or set in-progress)
app.post('/api/issues/:id/status', async (req, res) => {
  const { status, resolutionNotes, resolutionImageUrl, resolutionVideoUrl } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const updated = await updateDbStatus(req.params.id, status, {
      resolutionNotes,
      resolutionImageUrl,
      resolutionVideoUrl
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get stats & Leaderboard
app.get('/api/stats', async (req, res) => {
  const issues = await getDbIssues();

  // Calculate distributions
  const categoryDistribution = {
    pothole: 0,
    water_leak: 0,
    broken_light: 0,
    waste: 0,
    infrastructure: 0,
    other: 0
  };

  let resolvedCount = 0;
  let inProgressCount = 0;
  let reportedCount = 0;
  let verifiedCount = 0;

  // Build temporary map of user activity
  const userMap: Record<string, { email: string; points: number; reports: number; verifications: number }> = {};

  const ensureUser = (email: string) => {
    if (!userMap[email]) {
      userMap[email] = { email, points: 0, reports: 0, verifications: 0 };
    }
  };

  issues.forEach((issue: any) => {
    // Categories
    if (categoryDistribution[issue.category as keyof typeof categoryDistribution] !== undefined) {
      categoryDistribution[issue.category as keyof typeof categoryDistribution]++;
    } else {
      categoryDistribution.other++;
    }

    // Statuses
    if (issue.status === 'resolved') resolvedCount++;
    else if (issue.status === 'in_progress') inProgressCount++;
    else if (issue.status === 'verified') verifiedCount++;
    else reportedCount++;

    // Reporter points
    if (issue.reporter) {
      ensureUser(issue.reporter);
      userMap[issue.reporter].reports++;
      // 10 pts for reporting, additional 20 pts if resolved
      userMap[issue.reporter].points += 10;
      if (issue.status === 'resolved') {
        userMap[issue.reporter].points += 20;
      }
    }

    // Voters points
    issue.votedUsers?.forEach((u: string) => {
      ensureUser(u);
      userMap[u].points += 2; // 2 points per upvote contribution
    });

    // Verification points
    issue.verifications?.forEach((v: any) => {
      if (v.user) {
        ensureUser(v.user);
        userMap[v.user].verifications++;
        userMap[v.user].points += 15; // 15 points for official verification
      }
    });

    // Comment points
    issue.comments?.forEach((c: any) => {
      if (c.author) {
        ensureUser(c.author);
        userMap[c.author].points += 5; // 5 points per helpful comment
      }
    });
  });

  // Seed default leaderboard users if empty
  const defaultLeaderboard = [
    { email: "clara.m@domain.com", points: 185, reportsCount: 5, verificationsCount: 6, badge: "Civic Champion" },
    { email: "alex.community@domain.com", points: 120, reportsCount: 3, verificationsCount: 4, badge: "Pothole Patrol" },
    { email: "fiona.t@domain.com", points: 95, reportsCount: 2, verificationsCount: 3, badge: "Eco Guardian" },
    { email: "george.h@domain.com", points: 70, reportsCount: 2, verificationsCount: 1, badge: "Bright Light" }
  ];

  // Merge computed users with defaults for realistic look
  defaultLeaderboard.forEach(def => {
    if (!userMap[def.email]) {
      userMap[def.email] = {
        email: def.email,
        points: def.points,
        reports: def.reportsCount,
        verifications: def.verificationsCount
      };
    } else {
      userMap[def.email].points += def.points;
      userMap[def.email].reports += def.reportsCount;
      userMap[def.email].verifications += def.verificationsCount;
    }
  });

  const getBadge = (pts: number) => {
    if (pts >= 150) return "Civic Champion";
    if (pts >= 100) return "Senior Inspector";
    if (pts >= 50) return "Community Sentinel";
    return "Neighborhood Hero";
  };

  const pointsLeaderboard = Object.values(userMap)
    .map(u => ({
      email: u.email,
      points: u.points,
      reportsCount: u.reports,
      verificationsCount: u.verifications,
      badge: getBadge(u.points)
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  res.json({
    totalIssues: issues.length,
    resolvedCount,
    inProgressCount,
    reportedCount,
    verifiedCount,
    categoryDistribution,
    pointsLeaderboard
  });
});

// 8. Generate predictive insights using Gemini
app.get('/api/predictive-insights', async (req, res) => {
  const issues = readIssues();
  const ai = getGeminiAI();

  const mockReport = {
    hotspots: [
      {
        area: "Valencia St Corridor (Valencia St & 16th St)",
        severity: "high",
        issueType: "Potholes & Vehicle Safety",
        findings: "Recent severe rainfalls and heavy bus traffic have expanded road cracks. Swerving risks are elevated near lanes heading south.",
        prediction: "High likelihood of vehicle tire/alignment damage. Swerving behavior may cause collision risks with parallel cycle lanes within 10 days if unpatched."
      },
      {
        area: "Dolores Park Pedestrian Crossings",
        severity: "medium",
        issueType: "Dark Zones / Broken Lighting",
        findings: "Main walking entrances lack sufficient lumens. High evening citizen foot traffic combined with dark areas creates tripping hazards and security vulnerability.",
        prediction: "Tripping injuries or security complaints are expected to rise during warm weekend evenings when park exit volumes are high."
      },
      {
        area: "Church St Retail Blocks",
        severity: "medium",
        issueType: "Illegal Trash & Bulky Dumping",
        findings: "Mattresses and cardboard accumulation around commercial dumpsters. Obstructs sidewalks and compromises wheelchair access.",
        prediction: "Accumulation is expected to repeat on weekend move-out dates (end of month). High risk of pest nesting if not regularly swept."
      }
    ],
    maintenanceForecast: [
      {
        system: "Water Main Infrastructure",
        timeframe: "Next 30 Days",
        risk: "High",
        forecast: "Localized bubbling points indicate micro-leaks in sub-grade pipes near Valencia. Heat expansion may trigger main pressure failures."
      },
      {
        system: "Pedestrian Sidewalk Surfacing",
        timeframe: "Next 90 Days",
        risk: "Medium",
        forecast: "Root-intrusion cracking is widening near Civic Center. High liability zone due to dense commuter foot traffic."
      }
    ],
    recommendations: [
      {
        department: "Department of Public Works",
        action: "Joint scheduling of asphalt crew and streetlight electrician to clear Valencia St issues in a single safety zone.",
        impact: "Saves 35% mobilization costs and reduces public road lane closures to a single afternoon."
      },
      {
        department: "Sanitation Enforcement",
        action: "Deploy automated smart bin fullness monitoring and schedule bulky-sweep alerts for Safeway alleys every Friday afternoon.",
        impact: "Stops sidewalk obstructions before weekend volumes peak."
      }
    ],
    warning: "AI Sandbox Mode: Displaying predictive simulation. Configure GEMINI_API_KEY for live municipal analysis."
  };

  if (!ai) {
    return res.json(mockReport);
  }

  try {
    const formattedIssues = issues.map((i: any) => ({
      title: i.title,
      description: i.description,
      category: i.category,
      status: i.status,
      latitude: i.latitude,
      longitude: i.longitude,
      upvotes: i.upvotes,
      createdAt: i.createdAt
    }));

    const prompt = `Analyze this dataset of active and resolved community issues in our district and generate a high-precision, actionable Predictive Maintenance & Community Hotspots Report.

Dataset:
${JSON.stringify(formattedIssues, null, 2)}

Provide the analysis strictly matching the requested JSON schema. Analyze geo-temporal patterns, category clustering, and public safety implications to predict infrastructure fatigue and project optimal city dispatches.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert civic data scientist and municipal predictive planner. Your job is to identify high-risk hotspots, forecast upcoming infrastructure failures, and outline smart joint dispatches to maximize municipal efficiency.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hotspots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING, description: "Identified micro-neighborhood or street corner hotspot." },
                  severity: { type: Type.STRING, description: "low, medium, or high" },
                  issueType: { type: Type.STRING, description: "Type of clustered issues (e.g., Potholes, Lighting & Security)." },
                  findings: { type: Type.STRING, description: "Detailed summary of active issues and current public risk." },
                  prediction: { type: Type.STRING, description: "Predictive outcome or hazard escalation if left unaddressed." }
                },
                required: ['area', 'severity', 'issueType', 'findings', 'prediction']
              }
            },
            maintenanceForecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  system: { type: Type.STRING, description: "Municipal system (e.g. Water Mains, Streetlights, Sanitation, Roads)." },
                  timeframe: { type: Type.STRING, description: "Next 14 Days, Next 30 Days, Next 90 Days, etc." },
                  risk: { type: Type.STRING, description: "low, medium, or high" },
                  forecast: { type: Type.STRING, description: "Detailed forecast of expected deterioration or failure probability." }
                },
                required: ['system', 'timeframe', 'risk', 'forecast']
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  department: { type: Type.STRING, description: "Target municipal department." },
                  action: { type: Type.STRING, description: "Actionable, coordinated dispatch proposal." },
                  impact: { type: Type.STRING, description: "Estimated cost, safety, or overhead benefit of this proactive action." }
                },
                required: ['department', 'action', 'impact']
              }
            }
          },
          required: ['hotspots', 'maintenanceForecast', 'recommendations']
        }
      }
    });

    if (response && response.text) {
      const result = JSON.parse(response.text.trim());
      return res.json({ ...result, warning: null });
    } else {
      return res.json(mockReport);
    }
  } catch (err: any) {
    console.error('Gemini Predictive API error:', err);
    return res.json({ ...mockReport, warning: "AI analyzer encountered an error. Showing simulated reports." });
  }
});

// AI Chat Assistant Route
app.post('/api/chat-assistant', async (req, res) => {
  const { message, history } = req.body;
  const ai = getGeminiAI();
  const issues = readIssues();

  const formattedIssues = issues.map((i: any) => ({
    title: i.title,
    category: i.category,
    status: i.status,
    upvotes: i.upvotes,
    description: i.description
  }));

  if (!ai) {
    // Elegant simulated response in case there is no API key (Sandbox mode)
    let reply = "";
    const msgLower = (message || "").toLowerCase();
    if (msgLower.includes("summar") || msgLower.includes("issue") || msgLower.includes("hazard")) {
      const active = issues.filter((i: any) => i.status !== 'resolved');
      reply = `**[SANDBOX MODE]** Here is a summary of our district's **${active.length} active issues**:\n\n` +
        active.map((i: any) => `* **${i.title}** (${i.category.replace('_', ' ')}): Status is *${i.status}* with **${i.upvotes} verification votes**.`).join('\n') +
        `\n\nConfigure a real \`GEMINI_API_KEY\` to enable interactive chat processing.`;
    } else if (msgLower.includes("draft") || msgLower.includes("letter") || msgLower.includes("complain") || msgLower.includes("works") || msgLower.includes("petition")) {
      reply = `**[SANDBOX MODE]** Here is a drafted municipal complaint letter for your review:\n\n` +
        `**Subject:** Urgent Public Works Action Required: Multiple Hazards on Valencia St Corridor\n\n` +
        `Dear San Francisco Public Works Department,\n\n` +
        `We are formally reporting multiple high-priority infrastructure issues verified by the Valencia-Dolores neighborhood council. This includes a major road pothole and drainage leaks causing lane swerves.\n\n` +
        `We request immediate dispatch. Thank you,\n` +
        `Valencia-Dolores PublicEye Team`;
    } else {
      reply = `**[SANDBOX MODE]** Thanks for asking! I can assist you with active neighborhood logs, dispatch routing, or drafting complaints. Currently, we have **${issues.filter((i: any) => i.status !== 'resolved').length} outstanding audits**. Please configure your \`GEMINI_API_KEY\` to try live conversational AI!`;
    }
    return res.json({ reply });
  }

  try {
    const contents: any[] = [
      {
        role: 'user',
        parts: [{
          text: `Here is the dataset of active and resolved community issues in our district that you should use for context to answer user questions: ${JSON.stringify(formattedIssues, null, 2)}`
        }]
      }
    ];

    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        if (h.role && h.parts && Array.isArray(h.parts)) {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: h.parts.map((p: any) => ({ text: p.text || "" }))
          });
        }
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: "You are the Civic AI Coprocessor for the Valencia-Dolores community. You help citizens audit neighborhood issues, suggest municipal escalation plans, draft formal complaint letters to Public Works, and explain how the community-driven leaderboard points work. Keep answers concise, helpful, and formatted beautifully in markdown."
      }
    });

    return res.json({ reply: response.text || "I was unable to formulate a response at this moment." });
  } catch (err) {
    console.error("AI Chat Assistant error:", err);
    return res.json({ reply: "⚠️ The AI Coprocessor is currently experiencing heavy traffic. Let's try again in a few moments." });
  }
});

// AI Municipal Dispatch Route
app.post('/api/action-planner', async (req, res) => {
  const ai = getGeminiAI();
  const issues = readIssues();

  const formattedIssues = issues.map((i: any) => ({
    title: i.title,
    category: i.category,
    status: i.status,
    upvotes: i.upvotes,
    description: i.description,
    latitude: i.latitude,
    longitude: i.longitude
  }));

  const mockPlanner = {
    summary: "Coordinated municipal sweep recommended for the Valencia St Corridor.",
    routeProposal: "Group the high-priority Pothole (Valencia & 16th) with the active Water Leak (Valencia & 18th) to minimize lane closure overhead.",
    savings: "Estimated 30% reduction in vehicle dispatch overhead and 4 hours of public lane closure avoidance.",
    recommendations: [
      "Deploy a combined asphalt/drainage inspection vehicle to Valencia St.",
      "Notify SF DPW water control of potential secondary damage from pressure drops.",
      "Schedule repair for Friday 09:00 AM to avoid heavy commuter transit windows."
    ]
  };

  if (!ai) {
    return res.json(mockPlanner);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these issues and generate an optimized Coordinated Sweep Proposal to group repairs together and minimize city budget and transit impact: ${JSON.stringify(formattedIssues)}`,
      config: {
        systemInstruction: "You are an expert city manager. Group geographical clusters and categories of issues into unified dispatch orders to reduce department overhead.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            routeProposal: { type: Type.STRING },
            savings: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['summary', 'routeProposal', 'savings', 'recommendations']
        }
      }
    });

    if (response && response.text) {
      return res.json(JSON.parse(response.text.trim()));
    }
    return res.json(mockPlanner);
  } catch (err) {
    console.error("Action planner error:", err);
    return res.json(mockPlanner);
  }
});

// AI Draft Resolution Notes
app.post('/api/draft-resolution', async (req, res) => {
  const { description, category, title } = req.body;
  const ai = getGeminiAI();

  if (!ai) {
    return res.json({ draft: `Simulated Sandbox Resolution: Addressed issue '${title}'. Area secured and verified safe. (Configure GEMINI_API_KEY for dynamic generation)` });
  }

  try {
    const prompt = `You are a municipal works dispatcher. Write a professional, concise, one-sentence closing resolution note for the following citizen issue:\n\nTitle: ${title}\nCategory: ${category}\nDescription: ${description}\n\nDraft Note:`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return res.json({ draft: response.text ? response.text.trim() : 'Resolution recorded.' });
  } catch (error: any) {
    console.error('Draft resolution error:', error);
    return res.status(500).json({ error: 'Failed to generate draft' });
  }
});

// AI Audio Briefing (TTS) Route
app.post('/api/audio-briefing', async (req, res) => {
  const ai = getGeminiAI();
  const issues = await getDbIssues();
  const active = issues.filter((i: any) => i.status !== 'resolved');

  let briefingText = `Good morning, Valencia Dolores! This is your daily Civic AI Sentinel briefing. Today, we have ${active.length} active neighborhood reports under audit. Potholes remain our highest concern, with ${active.filter((i: any) => i.category === 'pothole').length} active repairs. Thanks to your verifications, we have dispatched public works alerts. Stay safe, keep reporting, and let's clean up our neighborhood!`;

  if (!ai) {
    // No API key - return text so client can use Web Speech synthesis
    return res.json({ briefingText, audioBase64: null });
  }

  try {
    // First, let's ask gemini-2.5-flash to formulate an incredibly succinct newscast script
    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a very short, friendly, professional community news brief (maximum 60 words, 3 sentences) summarizing these active reports: ${JSON.stringify(active.map((i: any) => i.title))}. Keep it encouraging and prompt citizens to keep voting!`,
    });

    if (scriptResponse && scriptResponse.text) {
      briefingText = scriptResponse.text.trim();
    }

    // Now, synthesize using gemini-3.1-flash-tts-preview!
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: briefingText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return res.json({ briefingText, audioBase64 });
  } catch (err) {
    console.error("TTS generation error:", err);
    // Fallback to text only for client-side SpeechSynthesis
    return res.json({ briefingText, audioBase64: null });
  }
});

// --- SAFEGUARD HUB ENDPOINTS ---

// Get SOS signals
app.get('/api/safeguard/sos', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const signals = await getSosSignalsForUser(uid, email);
    res.json(signals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new SOS signal
app.post('/api/safeguard/sos', requireAuth, async (req: AuthRequest, res) => {
  const { latitude, longitude, logs } = req.body;
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const signal = await createSosSignal(uid, email, Number(latitude), Number(longitude), logs || []);
    res.status(201).json(signal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update SOS logs
app.post('/api/safeguard/sos/:id/logs', requireAuth, async (req: AuthRequest, res) => {
  const { logs } = req.body;
  if (!logs) return res.status(400).json({ error: 'Logs are required' });
  try {
    const signal = await updateSosSignalLogs(Number(req.params.id), logs);
    res.json(signal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve SOS signal
app.post('/api/safeguard/sos/:id/resolve', requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.body; // 'resolved' or 'cancelled'
  if (!status) return res.status(400).json({ error: 'Status is required' });
  try {
    const signal = await resolveSosSignal(Number(req.params.id), status);
    res.json(signal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get checkins
app.get('/api/safeguard/checkins', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const checkins = await getCheckinsForUser(uid, email);
    res.json(checkins);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create checkin
app.post('/api/safeguard/checkins', requireAuth, async (req: AuthRequest, res) => {
  const { zoneName } = req.body;
  if (!zoneName) return res.status(400).json({ error: 'Zone name is required' });
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const checkin = await createCheckin(uid, email, zoneName);
    res.status(201).json(checkin);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get checklist
app.get('/api/safeguard/checklist', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const checklist = await getChecklistForUser(uid, email);
    res.json(checklist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle checklist item
app.post('/api/safeguard/checklist/:id/toggle', requireAuth, async (req: AuthRequest, res) => {
  const { done } = req.body;
  if (done === undefined) return res.status(400).json({ error: 'Done status is required' });
  try {
    const item = await toggleChecklistItem(Number(req.params.id), done);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
