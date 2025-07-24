import admin from 'firebase-admin';

const db = admin.firestore();
const MOOD_ENTRIES_COLLECTION = 'moodEntries';
const JOURNAL_ENTRIES_COLLECTION = 'journalEntries';


// Log new mood entry
const logMood = async (req, res) => {
  try {
    const userId = req.userId;
    const { moodRating, notes } = req.body;

    if (!moodRating) {
      return res.status(400).json({ message: 'Mood rating is required.' });
    }

    const newMoodEntry = {
      userId,
      moodRating,
      notes: notes || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(MOOD_ENTRIES_COLLECTION).add(newMoodEntry);
    const docSnap = await docRef.get();

    res.status(201).json({ id: docSnap.id, ...docSnap.data(), timestamp: docSnap.data().timestamp.toDate().toISOString() });
  } catch (error) {
    console.error('Error logging mood:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to log mood.', error: error.message });
  }
};


// Get all mood entries
const getMoodHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const moodEntriesRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(MOOD_ENTRIES_COLLECTION);
    const querySnapshot = await moodEntriesRef.orderBy('timestamp', 'desc').get();

    const moodHistory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null,
    }));

    res.status(200).json(moodHistory);
  } catch (error) {
    console.error('Error fetching mood history:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to fetch mood history.', error: error.message });
  }
};


// New journal entry
const createJournalEntry = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, content, moodEntryId } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Journal content is required.' });
    }

    const newJournalEntry = {
      userId,
      title: title || '',
      content,
      moodEntryId: moodEntryId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(JOURNAL_ENTRIES_COLLECTION).add(newJournalEntry);
    const docSnap = await docRef.get();

    res.status(201).json({ id: docSnap.id, ...docSnap.data(), timestamp: docSnap.data().timestamp.toDate().toISOString() });
  } catch (error) {
    console.error('Error creating journal entry:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to create journal entry.', error: error.message });
  }
};


// Get all journal entries
const getJournalEntries = async (req, res) => {
  try {
    const userId = req.userId;
    const journalEntriesRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(JOURNAL_ENTRIES_COLLECTION);
    const querySnapshot = await journalEntriesRef.orderBy('timestamp', 'desc').get();

    const journalEntries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null,
    }));

    res.status(200).json(journalEntries);
  } catch (error) {
    console.error('Error fetching journal entries:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to fetch journal entries.', error: error.message });
  }
};


// Delete a journal entry
const deleteJournalEntry = async (req, res) => {
  try {
    const userId = req.userId;
    const journalId = req.params.id;

    if (!journalId) {
      return res.status(400).json({ message: 'Journal entry ID is required.' });
    }

    const journalEntryRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(JOURNAL_ENTRIES_COLLECTION).doc(journalId);
    const doc = await journalEntryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Journal entry not found.' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this journal entry.' });
    }

    await journalEntryRef.delete();
    res.status(200).json({ message: 'Journal entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting journal entry:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to delete journal entry.', error: error.message });
  }
};


export {
  logMood,
  getMoodHistory,
  createJournalEntry,
  getJournalEntries,
  deleteJournalEntry, 
};
