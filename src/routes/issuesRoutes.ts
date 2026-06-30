import express from 'express';
import { getGeminiAI } from '../services/aiService.ts';
import { Type } from '@google/genai';
import {
  getDbIssues,
  insertDbIssue,
  upvoteDbIssue,
  addDbComment,
  addDbVerification,
  updateDbStatus
} from '../db/issues_db.ts';

const router = express.Router();

// 1. Get all issues
router.get('/', async (req, res) => {
  try {
    const list = await getDbIssues();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Report new issue with AI analysis
router.post('/', async (req, res) => {
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
router.post('/:id/vote', async (req, res) => {
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
router.post('/:id/comment', async (req, res) => {
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
router.post('/:id/verify', async (req, res) => {
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
router.post('/:id/status', async (req, res) => {
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

export default router;
