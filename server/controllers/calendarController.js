import { getDocumentsByQuery, addDocument, deleteDocument } from '../services/firestoreService.js';


// Fetch all calendar events
const getEvents = async (req, res) => {
  try {
    // userId is available from authMiddleware
    const userId = req.user.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }

    const collectionPath = `users/${userId}/events`;
    console.log(`[Backend] Attempting to fetch events from: ${collectionPath}`);
    const events = await getDocumentsByQuery(collectionPath, []); 
    console.log(`[Backend] Fetched events:`, events); 
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events.', error: error.message });
  }
};

// Add new calendar event
const addEvent = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }

    const { title, date, time, type, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required for an event.' });
    }

    const eventData = {
      userId, 
      title,
      date, 
      time: time || null, 
      type: type || 'assignment', 
      description: description || null
    };

    const collectionPath = `users/${userId}/events`;
    console.log(`[Backend] Attempting to add event to: ${collectionPath} with data:`, eventData);
    const newEvent = await addDocument(collectionPath, eventData);
    console.log(`[Backend] Successfully added event:`, newEvent); 
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error adding calendar event:', error);
    res.status(500).json({ message: 'Failed to add calendar event.', error: error.message });
  }
};

// Delete calendar event 
    const deleteEvent = async (req, res) => {
      try {
        const userId = req.user.uid;
        const { eventId } = req.params;

        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
        }
        if (!eventId) {
          return res.status(400).json({ message: 'Event ID is required for deletion.' });
        }

        const collectionPath = `users/${userId}/events`;
        console.log(`[Backend] Attempting to delete event ID: ${eventId} from: ${collectionPath}`);
        await deleteDocument(collectionPath, eventId); // Call firestoreService to delete
        console.log(`[Backend] Successfully deleted event ID: ${eventId}`);
        res.status(204).send(); 
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ message: 'Failed to delete calendar event.', error: error.message });
      }
    };


export {
  getEvents,
  addEvent,
  deleteEvent
};
