import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns'; // isValid for robust date checking
import { Plus, CheckSquare, Square, Trash2, Pencil } from 'lucide-react'; 


const safeParseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }
  if (typeof dateValue === 'object' && dateValue._seconds !== undefined) {
    const date = new Date(dateValue._seconds * 1000);
    return isValid(date) ? date : null;
  }
  if (typeof dateValue === 'string') {
    const date = parseISO(dateValue);
    return isValid(date) ? date : null;
  }
  if (dateValue instanceof Date && isValid(dateValue)) {
    return dateValue;
  }
  return null; 
};



function TaskManager({ userId, auth }) {
  const [tasks, setTasks] = useState([]); 
  const [filter, setFilter] = useState('all'); 
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium', 
    completed: false,
  });
  const [editingTask, setEditingTask] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Task Fetch
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || !auth) return;

      try {
        const idToken = await auth.currentUser.getIdToken();
        console.log('[Client] Fetching tasks...');
        const response = await axios.get(`${API_BASE_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setTasks(response.data);
        console.log('[Client] Fetched tasks:', response.data);
      } catch (error) {
        console.error('[Client] Error fetching tasks:', error);
        toast.error('Failed to load tasks.');
      }
    };

    fetchTasks();
  }, [userId, auth, API_BASE_URL]);

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTask) {
      setEditingTask(prev => ({ ...prev, [name]: value }));
    } else {
      setNewTask(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!userId || !auth) {
      toast.error('You must be logged in to add tasks.');
      return;
    }
    if (!newTask.title) {
      toast.error('Title is required.');
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log('[Client] Adding new task:', newTask);
      const response = await axios.post(`${API_BASE_URL}/tasks`, newTask, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setTasks(prev => [...prev, response.data]);
      toast.success('Task added successfully!');
      setShowAddTaskModal(false);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', completed: false });
      console.log('[Client] Task added, response:', response.data);
    } catch (error) {
      console.error('[Client] Error adding task:', error);
      toast.error('Failed to add task.');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask || !userId || !auth) {
      toast.error('Invalid task for update.');
      return;
    }
    if (!editingTask.title) {
      toast.error('Title is required.');
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log(`[Client] Updating task ID: ${editingTask.id}`, editingTask);
      const response = await axios.put(`${API_BASE_URL}/tasks/${editingTask.id}`, editingTask, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setTasks(prev => prev.map(task => (task.id === editingTask.id ? response.data : task)));
      toast.success('Task updated successfully!');
      setShowAddTaskModal(false); 
      setEditingTask(null); 
      console.log('[Client] Task updated, response:', response.data);
    } catch (error) {
      console.error('[Client] Error updating task:', error);
      toast.error('Failed to update task.');
    }
  };

  const handleToggleComplete = async (task) => {
    if (!userId || !auth) {
      toast.error('You must be logged in to update tasks.');
      return;
    }
    const updatedTask = { ...task, completed: !task.completed };
    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log(`[Client] Toggling completion for task ID: ${task.id}`, updatedTask);
      await axios.put(`${API_BASE_URL}/tasks/${task.id}`, updatedTask, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setTasks(prev => prev.map(t => (t.id === task.id ? updatedTask : t)));
      toast.success(`Task marked as ${updatedTask.completed ? 'completed' : 'to-do'}!`);
    } catch (error) {
      console.error('[Client] Error toggling task completion:', error);
      toast.error('Failed to update task completion.');
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete || !userId || !auth) {
      toast.error('Could not delete task. Missing information.');
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log(`[Client] Deleting task with ID: ${taskToDelete.id}`);
      await axios.delete(`${API_BASE_URL}/tasks/${taskToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
      toast.success('Task deleted successfully!');
      setShowConfirmDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('[Client] Error deleting task:', error);
      toast.error('Failed to delete task.');
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') {
      return task.completed;
    }
    if (filter === 'todo') {
      return !task.completed;
    }
    return true; 
  }).sort((a, b) => {
    // Sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; 
    }
    // Sort by due date
    const dateA = safeParseDate(a.dueDate); 
    const dateB = safeParseDate(b.dueDate); 

    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime();
    }
    if (dateA) return -1; 
    if (dateB) return 1; 
    return 0; 
  });

  // Render Ftns
  const renderTaskForm = (isEditing) => {
    const data = isEditing ? editingTask : newTask;
    const submitHandler = isEditing ? handleUpdateTask : handleAddTask;
    const title = isEditing ? 'Edit Task' : 'Add New Task';

    return (
      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-student-os-dark-gray mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={data.title}
            onChange={handleInputChange}
            className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-student-os-dark-gray mb-1">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={data.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
          ></textarea>
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-student-os-dark-gray mb-1">Due Date (Optional)</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={data.dueDate || ''}
            onChange={handleInputChange}
            className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
          />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-student-os-dark-gray mb-1">Priority</label>
          <select
            id="priority"
            name="priority"
            value={data.priority}
            onChange={handleInputChange}
            className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowAddTaskModal(false);
              setEditingTask(null); 
            }}
            className="px-5 py-2 rounded-lg border border-student-os-light-gray text-student-os-dark-gray hover:bg-student-os-light-gray transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-student-os-accent text-black hover:bg-student-os-accent/90 transition-colors shadow-md"
          >
            {isEditing ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="flex-grow p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-3xl font-bold text-student-os-dark-gray">
            Task Manager
          </h2>
          <button
            onClick={() => {
              setEditingTask(null); 
              setShowAddTaskModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-student-os-accent text-black flex items-center space-x-2 hover:bg-student-os-accent/90 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Filter Btns */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${filter === 'all' ? 'bg-student-os-accent text-black shadow-md' : 'bg-white text-student-os-dark-gray hover:bg-student-os-light-gray'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('todo')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${filter === 'todo' ? 'bg-student-os-accent text-black shadow-md' : 'bg-white text-student-os-dark-gray hover:bg-student-os-light-gray'}`}
          >
            To-Do
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${filter === 'completed' ? 'bg-student-os-accent text-black shadow-md' : 'bg-white text-student-os-dark-gray hover:bg-student-os-light-gray'}`}
          >
            Completed
          </button>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length === 0 ? (
            <p className="text-student-os-dark-gray col-span-full text-center py-8">
              No tasks found. Add a new task to get started!
            </p>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-custom-light p-5 border border-student-os-light-gray flex flex-col space-y-3"
              >
                {/* Task Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="text-student-os-accent hover:text-student-os-accent/80 transition-colors"
                      aria-label={task.completed ? 'Mark as To-Do' : 'Mark as Completed'}
                    >
                      {task.completed ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>
                    <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-student-os-light-gray' : 'text-student-os-dark-gray'}`}>
                      {task.title}
                    </h3>
                  </div>
                  {task.dueDate && ( 
                    <span className={`text-sm font-medium px-2 py-1 rounded-full
                      ${task.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {task.completed ? 'Completed' : `Due: ${format(safeParseDate(task.dueDate), 'MMM d')}`}
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-sm text-student-os-dark-gray">
                    {task.description}
                  </p>
                )}

                {task.createdAt && (
                  <p className="text-xs text-student-os-light-gray">
                    Created: {format(safeParseDate(task.createdAt), 'MMM d, yyyy')}
                  </p>
                )}

                {/* Task Priority */}
                <div className="flex justify-between items-center text-sm text-student-os-light-gray">
                  <span className={`font-medium px-2 py-1 rounded-full
                    ${task.priority === 'low' ? 'bg-blue-100 text-blue-700' :
                      task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'}`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowAddTaskModal(true); 
                      }}
                      className="p-1 rounded-lg text-student-os-dark-gray hover:bg-student-os-light-gray transition-colors"
                      aria-label="Edit Task"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-1 rounded-lg text-student-os-dark-gray hover:bg-red-50 transition-colors"
                      aria-label="Delete Task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Task Modal */}
        {showAddTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-custom-medium p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-6 text-black">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              {renderTaskForm(!!editingTask)}
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showConfirmDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-custom-medium p-6 w-full max-w-sm text-center">
              <h3 className="text-xl font-bold mb-4 text-student-os-dark-gray">Confirm Deletion</h3>
              <p className="mb-6 text-student-os-dark-gray">
                Are you sure you want to delete the task: <span className="font-semibold">"{taskToDelete?.title}"</span>?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmDeleteModal(false)}
                  className="px-5 py-2 rounded-lg border border-student-os-light-gray text-student-os-dark-gray hover:bg-student-os-light-gray transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskManager;
