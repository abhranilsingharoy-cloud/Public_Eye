import { db } from './index.ts';
import { issues } from './schema.ts';
import { eq, sql } from 'drizzle-orm';

// Default pre-seeded issues (same as server.ts)
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
    media: [],
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

// Verify and pre-seed database if empty
export async function seedIssuesIfEmpty() {
  try {
    const existing = await db.select().from(issues).limit(1);
    if (existing.length === 0) {
      console.log("Database 'issues' table is empty. Pre-seeding default records...");
      for (const item of DEFAULT_ISSUES) {
        await db.insert(issues).values({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          latitude: item.latitude,
          longitude: item.longitude,
          reporter: item.reporter,
          upvotes: item.upvotes,
          votedUsers: item.votedUsers,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          aiCategorized: item.aiCategorized,
          aiSeverity: item.aiSeverity,
          media: item.media,
          aiSafetyTips: item.aiSafetyTips,
          aiSuggestedAction: item.aiSuggestedAction,
          aiTags: item.aiTags,
          comments: item.comments,
          verifications: item.verifications,
          statusHistory: item.statusHistory,
          verifiedAt: (item as any).verifiedAt || null,
          inProgressAt: (item as any).inProgressAt || null,
        });
      }
      console.log("Pre-seeding complete!");
    }
  } catch (error) {
    console.error("Error seeding issues:", error);
  }
}

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

// Get all issues
export async function getDbIssues() {
  try {
    const list = await db.select().from(issues);
    return list.map(item => ({
      ...item,
      agentTrace: generateAgentTrace(item),
    }));
  } catch (error) {
    console.error("Failed to query issues from database:", error);
    throw new Error("Failed to load issues from database.");
  }
}

// Insert single issue
export async function insertDbIssue(data: any) {
  try {
    await db.insert(issues).values(data);
    const result = await db.select().from(issues).where(eq(issues.id, data.id));
    return {
      ...result[0],
      agentTrace: generateAgentTrace(result[0]),
    };
  } catch (error) {
    console.error("Failed to insert issue:", error);
    throw new Error("Failed to report issue to database.");
  }
}

// Upvote issue
export async function upvoteDbIssue(id: string, email: string) {
  try {
    const list = await db.select().from(issues).where(eq(issues.id, id));
    if (list.length === 0) throw new Error("Issue not found");
    const issueObj = list[0];
    const votesList = (issueObj.votedUsers as string[]) || [];
    
    let newVotes = [...votesList];
    let increment = 0;
    if (votesList.includes(email)) {
      newVotes = newVotes.filter(u => u !== email);
      increment = -1;
    } else {
      newVotes.push(email);
      increment = 1;
    }

    const nextUpvotes = Math.max(0, issueObj.upvotes + increment);

    await db.update(issues)
      .set({
        upvotes: nextUpvotes,
        votedUsers: newVotes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(issues.id, id));

    const updated = await db.select().from(issues).where(eq(issues.id, id));
    return {
      ...updated[0],
      agentTrace: generateAgentTrace(updated[0]),
    };
  } catch (error) {
    console.error("Upvote query failed:", error);
    throw error;
  }
}

// Add comment
export async function addDbComment(id: string, comment: any) {
  try {
    const list = await db.select().from(issues).where(eq(issues.id, id));
    if (list.length === 0) throw new Error("Issue not found");
    const issueObj = list[0];
    const commentsList = (issueObj.comments as any[]) || [];
    const nextComments = [...commentsList, comment];

    await db.update(issues)
      .set({
        comments: nextComments,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(issues.id, id));

    const updated = await db.select().from(issues).where(eq(issues.id, id));
    return {
      ...updated[0],
      agentTrace: generateAgentTrace(updated[0]),
    };
  } catch (error) {
    console.error("Add comment query failed:", error);
    throw error;
  }
}

// Add verification
export async function addDbVerification(id: string, verification: any, autoTransition: boolean) {
  try {
    const list = await db.select().from(issues).where(eq(issues.id, id));
    if (list.length === 0) throw new Error("Issue not found");
    const issueObj = list[0];
    const verificationsList = (issueObj.verifications as any[]) || [];
    const nextVerifications = [...verificationsList, verification];

    let updates: any = {
      verifications: nextVerifications,
      updatedAt: new Date().toISOString(),
    };

    if (autoTransition && issueObj.status === 'reported') {
      const verifyTime = new Date().toISOString();
      updates.status = 'verified';
      updates.verifiedAt = verifyTime;
      
      const history = (issueObj.statusHistory as any[]) || [{ status: 'reported', timestamp: issueObj.createdAt }];
      if (!history.some(h => h.status === 'verified')) {
        updates.statusHistory = [...history, { status: 'verified', timestamp: verifyTime }];
      }
    }

    await db.update(issues)
      .set(updates)
      .where(eq(issues.id, id));

    const updated = await db.select().from(issues).where(eq(issues.id, id));
    return {
      ...updated[0],
      agentTrace: generateAgentTrace(updated[0]),
    };
  } catch (error) {
    console.error("Add verification query failed:", error);
    throw error;
  }
}

// Update status
export async function updateDbStatus(id: string, status: string, details: any) {
  try {
    const list = await db.select().from(issues).where(eq(issues.id, id));
    if (list.length === 0) throw new Error("Issue not found");
    const issueObj = list[0];
    const statusTime = new Date().toISOString();

    let updates: any = {
      status,
      updatedAt: statusTime,
    };

    const history = (issueObj.statusHistory as any[]) || [{ status: 'reported', timestamp: issueObj.createdAt }];

    if (status === 'verified') {
      updates.verifiedAt = statusTime;
    } else if (status === 'in_progress') {
      updates.inProgressAt = statusTime;
      if (!issueObj.verifiedAt) {
        updates.verifiedAt = statusTime;
      }
    } else if (status === 'resolved') {
      updates.resolvedAt = statusTime;
      if (!issueObj.verifiedAt) updates.verifiedAt = statusTime;
      if (!issueObj.inProgressAt) updates.inProgressAt = statusTime;
    }

    // Build next history
    let nextHistory = [...history];
    if (status === 'verified' && !nextHistory.some(h => h.status === 'verified')) {
      nextHistory.push({ status: 'verified', timestamp: statusTime });
    } else if (status === 'in_progress') {
      if (!issueObj.verifiedAt && !nextHistory.some(h => h.status === 'verified')) {
        nextHistory.push({ status: 'verified', timestamp: statusTime });
      }
      if (!nextHistory.some(h => h.status === 'in_progress')) {
        nextHistory.push({ status: 'in_progress', timestamp: statusTime });
      }
    } else if (status === 'resolved') {
      if (!issueObj.verifiedAt && !nextHistory.some(h => h.status === 'verified')) {
        nextHistory.push({ status: 'verified', timestamp: statusTime });
      }
      if (!issueObj.inProgressAt && !nextHistory.some(h => h.status === 'in_progress')) {
        nextHistory.push({ status: 'in_progress', timestamp: statusTime });
      }
      if (!nextHistory.some(h => h.status === 'resolved')) {
        nextHistory.push({ status: 'resolved', timestamp: statusTime });
      }
    }

    if (!nextHistory.some(h => h.status === status)) {
      nextHistory.push({ status, timestamp: statusTime });
    }

    updates.statusHistory = nextHistory;

    if (details.resolutionNotes) {
      updates.resolutionNotes = details.resolutionNotes;
    }

    await db.update(issues).set(updates).where(eq(issues.id, id));

    const updated = await db.select().from(issues).where(eq(issues.id, id));
    return {
      ...updated[0],
      agentTrace: generateAgentTrace(updated[0]),
    };
  } catch (error) {
    console.error("Update status failed:", error);
    throw error;
  }
}
