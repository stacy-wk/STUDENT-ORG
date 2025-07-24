import { getDocumentsByQuery, addDocument, updateDocument, deleteDocument } from '../services/firestoreService.js';


// Fetch all tasks
const getTasks = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }

    const collectionPath = `users/${userId}/tasks`;
    console.log(`[Backend] Attempting to fetch tasks from: ${collectionPath}`);
    const tasks = await getDocumentsByQuery(collectionPath, []); // Fetch all tasks for user
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks.', error: error.message });
  }
};

// Add new task
const addTask = async (req, res) => {
  try {
    const userId = req.user.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }

    const { title, description, dueDate, priority, completed } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required for a task.' });
    }

    const taskData = {
      userId, 
      title,
      description: description || null,
      dueDate: dueDate || null, 
      priority: priority || 'medium', 
      completed: completed || false, 
    };

    const collectionPath = `users/${userId}/tasks`;
    console.log(`[Backend] Attempting to add task to: ${collectionPath} with data:`, taskData);
    const newTask = await addDocument(collectionPath, taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Failed to add task.', error: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { taskId } = req.params;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required for update.' });
    }

    const updatedData = req.body;
    if (updatedData.userId && updatedData.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: Cannot update another user\'s task.' });
    }

    const collectionPath = `users/${userId}/tasks`;
    console.log(`[Backend] Attempting to update task ID: ${taskId} in: ${collectionPath} with data:`, updatedData);
    await updateDocument(collectionPath, taskId, updatedData);

    // Fetch updated document to return to client
    const updatedTask = await getDocumentsByQuery(collectionPath, [['id', '==', taskId]]);
    if (updatedTask.length === 0) {
      return res.status(404).json({ message: 'Task not found after update.' });
    }

    res.status(200).json(updatedTask[0]); 
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task.', error: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { taskId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required for deletion.' });
    }

    const collectionPath = `users/${userId}/tasks`;
    console.log(`[Backend] Attempting to delete task ID: ${taskId} from: ${collectionPath}`);
    await deleteDocument(collectionPath, taskId);
    res.status(204).send(); // successful deletion
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task.', error: error.message });
  }
};

export {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
};
