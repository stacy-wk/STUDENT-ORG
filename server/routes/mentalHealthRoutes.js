import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  logMood,
  getMoodHistory,
  createJournalEntry,
  getJournalEntries,
  deleteJournalEntry,
} from '../controllers/mentalHealthController.js';

const router = express.Router();

// Mood Tracking Routes
router.post('/mood', authenticateToken, logMood);
router.get('/mood', authenticateToken, getMoodHistory);

// Journaling Routes
router.post('/journal', authenticateToken, createJournalEntry);
router.get('/journal', authenticateToken, getJournalEntries);
router.delete('/journal/:id', authenticateToken, deleteJournalEntry); 

export default router;
