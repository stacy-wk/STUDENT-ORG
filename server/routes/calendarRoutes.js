import express from 'express';
import { getEvents, addEvent, deleteEvent } from '../controllers/calendarController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';


const router = express.Router();


router.get('/events', authenticateToken, getEvents);
router.post('/events', authenticateToken, addEvent);
router.delete('/events/:eventId', authenticateToken, deleteEvent);

export default router;
