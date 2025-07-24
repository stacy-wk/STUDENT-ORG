import admin from 'firebase-admin';

const db = admin.firestore();
const TRANSACTIONS_COLLECTION = 'transactions';


// Add new transaction
const addTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required for a transaction.' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "income" or "expense".' });
    }

    const newTransaction = {
      userId,
      type,
      amount,
      category,
      description: description || '',
      timestamp: date ? admin.firestore.Timestamp.fromDate(new Date(date)) : admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(TRANSACTIONS_COLLECTION).add(newTransaction);
    const docSnap = await docRef.get();

    res.status(201).json({
      id: docSnap.id,
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate().toISOString(),
    });
  } catch (error) {
    console.error('Error adding transaction:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to add transaction.', error: error.message });
  }
};


// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const transactionsRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(TRANSACTIONS_COLLECTION);
    const querySnapshot = await transactionsRef.orderBy('timestamp', 'desc').get();

    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null,
    }));

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to fetch transactions.', error: error.message });
  }
};



// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const transactionId = req.params.id;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required.' });
    }

    const transactionRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(TRANSACTIONS_COLLECTION).doc(transactionId);
    const doc = await transactionRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction.' });
    }

    await transactionRef.delete();
    res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Error deleting transaction:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to delete transaction.', error: error.message });
  }
};

export {
  addTransaction,
  getTransactions,
  deleteTransaction,
};
