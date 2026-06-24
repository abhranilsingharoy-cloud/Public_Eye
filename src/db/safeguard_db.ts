import { db } from './index.ts';
import { users, safeguardSos, safeguardCheckins, safeguardChecklist } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// Synchronize user profile and return user.id
async function getUserIdByUid(uid: string, email: string) {
  let list = await db.select().from(users).where(eq(users.uid, uid));
  if (list.length === 0) {
    const inserted = await db.insert(users)
      .values({ uid, email })
      .returning();
    return inserted[0].id;
  }
  return list[0].id;
}

// SOS Operations
export async function getSosSignalsForUser(uid: string, email: string) {
  try {
    const userId = await getUserIdByUid(uid, email);
    return await db.select()
      .from(safeguardSos)
      .where(eq(safeguardSos.userId, userId))
      .orderBy(desc(safeguardSos.createdAt));
  } catch (error) {
    console.error("Failed to query SOS signals:", error);
    throw new Error("Failed to load SOS history.", { cause: error });
  }
}

export async function createSosSignal(uid: string, email: string, lat: number, lng: number, logs: string[]) {
  try {
    const userId = await getUserIdByUid(uid, email);
    const result = await db.insert(safeguardSos)
      .values({
        userId,
        latitude: lat,
        longitude: lng,
        logs,
        status: 'active'
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to insert SOS signal:", error);
    throw new Error("Failed to register SOS distress signal.", { cause: error });
  }
}

export async function updateSosSignalLogs(id: number, logs: string[]) {
  try {
    const result = await db.update(safeguardSos)
      .set({ logs })
      .where(eq(safeguardSos.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to update SOS logs:", error);
    throw new Error("Failed to update transmission telemetry.", { cause: error });
  }
}

export async function resolveSosSignal(id: number, status: string) {
  try {
    const result = await db.update(safeguardSos)
      .set({ status })
      .where(eq(safeguardSos.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to resolve SOS signal:", error);
    throw new Error("Failed to clear distress signal.", { cause: error });
  }
}

// Check-ins Operations
export async function getCheckinsForUser(uid: string, email: string) {
  try {
    const userId = await getUserIdByUid(uid, email);
    return await db.select()
      .from(safeguardCheckins)
      .where(eq(safeguardCheckins.userId, userId))
      .orderBy(desc(safeguardCheckins.checkedInAt));
  } catch (error) {
    console.error("Failed to query checkins:", error);
    throw new Error("Failed to load active Check-Ins.", { cause: error });
  }
}

export async function createCheckin(uid: string, email: string, zoneName: string) {
  try {
    const userId = await getUserIdByUid(uid, email);
    const result = await db.insert(safeguardCheckins)
      .values({
        userId,
        zoneName,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to insert check-in:", error);
    throw new Error("Failed to process Check-In.", { cause: error });
  }
}

// Checklist Operations
export async function getChecklistForUser(uid: string, email: string) {
  try {
    const userId = await getUserIdByUid(uid, email);
    let items = await db.select()
      .from(safeguardChecklist)
      .where(eq(safeguardChecklist.userId, userId))
      .orderBy(safeguardChecklist.id);
    
    // Seed default checklist items if empty
    if (items.length === 0) {
      const defaults = [
        'Confirm companion tracking status',
        'Map well-lit streets using the Heatmap',
        'Confirm local Safe Zone checkpoints',
        'Verify device charge above 20%',
      ];
      for (const text of defaults) {
        await db.insert(safeguardChecklist).values({
          userId,
          text,
          done: text.includes('well-lit') || text.includes('charge') // Seed some done
        });
      }
      items = await db.select()
        .from(safeguardChecklist)
        .where(eq(safeguardChecklist.userId, userId))
        .orderBy(safeguardChecklist.id);
    }
    return items;
  } catch (error) {
    console.error("Failed to load checklist:", error);
    throw new Error("Failed to retrieve checklist options.", { cause: error });
  }
}

export async function toggleChecklistItem(id: number, done: boolean) {
  try {
    const result = await db.update(safeguardChecklist)
      .set({
        done,
        updatedAt: new Date(),
      })
      .where(eq(safeguardChecklist.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to toggle checklist item:", error);
    throw new Error("Failed to update safety checkbox.", { cause: error });
  }
}
