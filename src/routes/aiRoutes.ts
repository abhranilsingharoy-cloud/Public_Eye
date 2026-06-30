import express from 'express';
import { getGeminiAI } from '../services/aiService.ts';
import { getDbIssues } from '../db/issues_db.ts';
import { Type } from '@google/genai';

const router = express.Router();

// 8. Generate predictive insights using Gemini
router.get('/predictive-insights', async (req, res) => {
  const issues = await getDbIssues();
  const ai = getGeminiAI();

  const mockReport = {
    hotspots: [
      {
        area: "Valencia St Corridor (Valencia St & 16th St)",
        severity: "high",
        issueType: "Potholes & Vehicle Safety",
        findings: "Recent severe rainfalls and heavy bus traffic have expanded road cracks. Swerving risks are elevated near lanes heading south.",
        prediction: "High likelihood of vehicle tire/alignment damage. Swerving behavior may cause collision risks with parallel cycle lanes within 10 days if unpatched."
      }
    ],
    maintenanceForecast: [
      {
        system: "Water Main Infrastructure",
        timeframe: "Next 30 Days",
        risk: "High",
        forecast: "Localized bubbling points indicate micro-leaks in sub-grade pipes near Valencia."
      }
    ],
    recommendations: [
      {
        department: "Department of Public Works",
        action: "Joint scheduling of asphalt crew and streetlight electrician to clear Valencia St issues in a single safety zone.",
        impact: "Saves 35% mobilization costs and reduces public road lane closures to a single afternoon."
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
                  issueType: { type: Type.STRING, description: "Type of clustered issues." },
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
                  system: { type: Type.STRING, description: "Municipal system." },
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
router.post('/chat-assistant', async (req, res) => {
  const { message, history } = req.body;
  const ai = getGeminiAI();
  const issues = await getDbIssues();

  const formattedIssues = issues.map((i: any) => ({
    title: i.title,
    category: i.category,
    status: i.status,
    upvotes: i.upvotes,
    description: i.description
  }));

  if (!ai) {
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
router.post('/action-planner', async (req, res) => {
  const ai = getGeminiAI();
  const issues = await getDbIssues();

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
router.post('/draft-resolution', async (req, res) => {
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
router.post('/audio-briefing', async (req, res) => {
  const ai = getGeminiAI();
  const issues = await getDbIssues();
  const active = issues.filter((i: any) => i.status !== 'resolved');

  let briefingText = `Good morning, Valencia Dolores! This is your daily Civic AI Sentinel briefing. Today, we have ${active.length} active neighborhood reports under audit. Potholes remain our highest concern, with ${active.filter((i: any) => i.category === 'pothole').length} active repairs. Thanks to your verifications, we have dispatched public works alerts. Stay safe, keep reporting, and let's clean up our neighborhood!`;

  if (!ai) {
    return res.json({ briefingText, audioBase64: null });
  }

  try {
    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a very short, friendly, professional community news brief (maximum 60 words, 3 sentences) summarizing these active reports: ${JSON.stringify(active.map((i: any) => i.title))}. Keep it encouraging and prompt citizens to keep voting!`,
    });

    if (scriptResponse && scriptResponse.text) {
      briefingText = scriptResponse.text.trim();
    }

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
    return res.json({ briefingText, audioBase64: null });
  }
});

export default router;
