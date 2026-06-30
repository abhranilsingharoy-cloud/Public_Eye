import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import {
  getSosSignalsForUser,
  createSosSignal,
  updateSosSignalLogs,
  resolveSosSignal,
  getCheckinsForUser,
  createCheckin,
  getChecklistForUser,
  toggleChecklistItem
} from '../db/safeguard_db.ts';

const router = express.Router();

// Get SOS signals
router.get('/sos', requireAuth, async (req: AuthRequest, res) => {
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
router.post('/sos', requireAuth, async (req: AuthRequest, res) => {
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
router.post('/sos/:id/logs', requireAuth, async (req: AuthRequest, res) => {
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
router.post('/sos/:id/resolve', requireAuth, async (req: AuthRequest, res) => {
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
router.get('/checkins', requireAuth, async (req: AuthRequest, res) => {
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
router.post('/checkins', requireAuth, async (req: AuthRequest, res) => {
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
router.get('/checklist', requireAuth, async (req: AuthRequest, res) => {
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
router.post('/checklist/:id/toggle', requireAuth, async (req: AuthRequest, res) => {
  const { done } = req.body;
  if (done === undefined) return res.status(400).json({ error: 'Done status is required' });
  try {
    const item = await toggleChecklistItem(Number(req.params.id), done);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
