import admin from 'firebase-admin';

const db = admin.firestore();
const NOTIFICATIONS_COLLECTION = 'notifications';

// Add Notifs
const addNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, message, type, scheduledAt } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Title, message, and type are required for a notification/reminder.' });
    }
    if (!['notification', 'reminder'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "notification" or "reminder".' });
    }

    const newNotification = {
      userId,
      title,
      message,
      type,
      read: false, 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      scheduledAt: scheduledAt ? admin.firestore.Timestamp.fromDate(new Date(scheduledAt)) : null, // For reminders
    };

    // Firestore path: artifacts/{appId}/users/{userId}/notifications/{docId}
    const docRef = await db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(NOTIFICATIONS_COLLECTION).add(newNotification);
    const docSnap = await docRef.get();

    res.status(201).json({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt.toDate().toISOString(),
      scheduledAt: docSnap.data().scheduledAt ? docSnap.data().scheduledAt.toDate().toISOString() : null,
    });
  } catch (error) {
    console.error('Error adding notification/reminder:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to add notification/reminder.', error: error.message });
  }
};


// Get Notifs
const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, read } = req.query;

    let notificationsRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(NOTIFICATIONS_COLLECTION);

    if (type) {
      notificationsRef = notificationsRef.where('type', '==', type);
    }
    if (read !== undefined) {
      notificationsRef = notificationsRef.where('read', '==', read === 'true');
    }

    const querySnapshot = await notificationsRef.orderBy('createdAt', 'desc').get();

    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null,
      scheduledAt: doc.data().scheduledAt ? doc.data().scheduledAt.toDate().toISOString() : null,
    }));

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications/reminders:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to fetch notifications/reminders.', error: error.message });
  }
};



const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required.' });
    }

    const notificationRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(NOTIFICATIONS_COLLECTION).doc(notificationId);
    const doc = await notificationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Notification/Reminder not found.' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this notification/reminder.' });
    }

    await notificationRef.update({ read: true });
    const updatedDoc = await notificationRef.get();

    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt ? updatedDoc.data().createdAt.toDate().toISOString() : null,
      scheduledAt: updatedDoc.data().scheduledAt ? updatedDoc.data().scheduledAt.toDate().toISOString() : null,
    });
  } catch (error) {
    console.error('Error marking notification/reminder as read:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to mark as read.', error: error.message });
  }
};


// Delete Notifs
const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required.' });
    }

    const notificationRef = db.collection('artifacts').doc(process.env.FIREBASE_PROJECT_ID).collection('users').doc(userId).collection(NOTIFICATIONS_COLLECTION).doc(notificationId);
    const doc = await notificationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Notification/Reminder not found.' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this notification/reminder.' });
    }

    await notificationRef.delete();
    res.status(200).json({ message: 'Notification/Reminder deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification/reminder:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to delete notification/reminder.', error: error.message });
  }
};

export {
  addNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
};
