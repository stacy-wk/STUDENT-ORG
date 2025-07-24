import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  addTransaction,
  getTransactions,
  deleteTransaction,
} from '../controllers/financeController.js';

const router = express.Router();

router.post('/transactions', authenticateToken, addTransaction);
router.get('/transactions', authenticateToken, getTransactions);
router.delete('/transactions/:id', authenticateToken, deleteTransaction);

export default router;
