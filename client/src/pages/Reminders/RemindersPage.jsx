import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  Bell, Plus, Trash2, CheckCircle, Circle, Clock, Loader2, CalendarDays
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';


const safeParseTimestamp = (timestampValue) => {
  if (!timestampValue) {
    return null;
  }
  if (typeof timestampValue === 'object' && timestampValue.seconds !== undefined) {
    const date = new Date(timestampValue.seconds * 1000);
    return isValid(date) ? date : null;
  }
  if (typeof timestampValue === 'string') {
    const date = new Date(timestampValue); 
    return isValid(date) ? date : null;
  }
  if (timestampValue instanceof Date && isValid(timestampValue)) {
    return timestampValue;
  }
  return null;
};


function RemindersPage({ userId, userProfile, isAxiosAuthReady }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('all');


  useEffect(() => {
    const fetchReminders = async () => {
      if (!userId || !isAxiosAuthReady) {
        console.log('[RemindersPage] Skipping fetchReminders: userId or isAxiosAuthReady not ready.');
        return;
      }
      setLoading(true);
      console.log('[RemindersPage] Attempting to fetch reminders from:', `${API_BASE_URL}/api/notifications`); 
      try {
        const params = { type: 'reminder' }; 
        if (filterStatus === 'done') {
          params.read = 'true'; 
        } else if (filterStatus === 'all') {
        
        }

        const response = await axios.get(`${API_BASE_URL}/api/notifications`, { params });
        setReminders(response.data);
        console.log('[RemindersPage] Reminders fetched successfully.');
      } catch (error) {
        console.error('[RemindersPage] Error fetching reminders:', error.response?.data || error.message);
        // toast.error('Failed to load reminders.');
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, [userId, API_BASE_URL, isAxiosAuthReady, filterStatus]); // Re-fetch when filter changes

  
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      toast.error('Title and message are required.');
      return;
    }
    if (!newScheduledAt) {
      toast.error('Scheduled date/time is required for reminders.');
      return;
    }
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to add reminder.');
      return;
    }

    const payload = {
      title: newTitle.trim(),
      message: newMessage.trim(),
      type: 'reminder', 
      scheduledAt: new Date(newScheduledAt).toISOString(),
    };

    console.log('[RemindersPage] Sending add reminder request with payload:', payload);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/notifications`, payload);
      setReminders(prev => [response.data, ...prev]); 
      toast.success('Reminder added successfully!');
      console.log('[RemindersPage] Reminder added successfully:', response.data);
    
      setNewTitle('');
      setNewMessage('');
      setNewScheduledAt('');
      
    } catch (error) {
      console.error('[RemindersPage] Error adding reminder:', error.response?.data || error.message);
      toast.error('Failed to add reminder: ' + (error.response?.data?.message || error.message));
    }
  };

  
  const handleMarkAsDone = async (reminderId) => {
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to update reminder.');
      return;
    }

    console.log(`[RemindersPage] Attempting to mark reminder ${reminderId} as done.`);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/notifications/${reminderId}/read`); 
      setReminders(prev => prev.map(notif =>
        notif.id === reminderId ? { ...notif, read: true } : notif
      ));
      toast.success('Reminder marked as done!');
      console.log(`[RemindersPage] Reminder ${reminderId} marked as done.`);
    } catch (error) {
      console.error(`[RemindersPage] Error marking reminder ${reminderId} as done:`, error.response?.data || error.message);
      toast.error('Failed to mark as done: ' + (error.response?.data?.message || error.message));
    }
  };


  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to delete reminder.');
      return;
    }

    console.log(`[RemindersPage] Attempting to delete reminder with ID: ${reminderId}`);
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/${reminderId}`); 
      setReminders(prev => prev.filter(notif => notif.id !== reminderId));
      toast.success('Reminder deleted successfully!');
      console.log(`[RemindersPage] Reminder ${reminderId} deleted successfully.`);
    } catch (error) {
      console.error(`[RemindersPage] Error deleting reminder ${reminderId}:`, error.response?.data || error.message);
      toast.error('Failed to delete reminder: ' + (error.response?.data?.message || error.message));
    }
  };

  
  const filteredReminders = reminders.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'done') return r.read;
    return false; 
  });

  return (
    <div className="flex-grow p-4 md:p-8 flex flex-col h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto flex flex-grow w-full bg-white rounded-xl shadow-custom-medium overflow-hidden">
        <div className="w-full flex flex-col p-4 md:p-6 overflow-y-auto">

          {/* Add New Reminder Form */}
          <div className="bg-student-os-light-gray p-5 rounded-lg shadow-sm mb-6">
            <h3 className="text-xl font-semibold text-student-os-dark-gray mb-4">Create New Reminder</h3>
            <form onSubmit={handleAddReminder} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="newTitle" className="block text-sm font-medium text-student-os-dark-gray mb-1">Title</label>
                <input
                  type="text"
                  id="newTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Submit Essay"
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="newMessage" className="block text-sm font-medium text-student-os-dark-gray mb-1">Message</label>
                <textarea
                  id="newMessage"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Don't forget to upload the final draft to the portal."
                  rows="3"
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  required
                ></textarea>
              </div>

              {/* Scheduled At */}
              <div>
                <label htmlFor="newScheduledAt" className="block text-sm font-medium text-student-os-dark-gray mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  id="newScheduledAt"
                  value={newScheduledAt}
                  onChange={(e) => setNewScheduledAt(e.target.value)}
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-student-os-accent text-black rounded-lg shadow-md hover:bg-student-os-accent/90 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Reminder</span>
              </button>
            </form>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full border-2 transition-all duration-200
                ${filterStatus === 'all' ? 'bg-student-os-accent text-black border-student-os-accent shadow-md' : 'bg-white text-student-os-dark-gray border-student-os-light-gray hover:border-student-os-accent'}`}
            >
              All Reminders
            </button>
            <button
              onClick={() => setFilterStatus('done')}
              className={`px-4 py-2 rounded-full border-2 transition-all duration-200
                ${filterStatus === 'done' ? 'bg-student-os-accent text-black border-student-os-accent shadow-md' : 'bg-white text-student-os-dark-gray border-student-os-light-gray hover:border-student-os-accent'}`}
            >
              Done Reminders
            </button>
          </div>

          {/* Reminders List */}
          <h3 className="text-xl font-bold text-student-os-dark-gray mb-4">
            {filterStatus === 'all' ? 'All Your Reminders' : 'Your Done Reminders'}
          </h3>
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 size={24} className="animate-spin text-student-os-accent" />
              <p className="ml-2 text-student-os-dark-gray">Loading reminders...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <p className="text-student-os-light-gray">No {filterStatus === 'all' ? '' : 'matching '}reminders found.</p>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map(reminder => (
                <div key={reminder.id} className={`p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between
                  ${reminder.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-student-os-dark-gray border border-blue-200'}`}>
                  <div className="flex items-start space-x-3 flex-grow mb-2 md:mb-0">
                    <Clock size={20} className="text-student-os-accent flex-shrink-0 mt-1 md:mt-0" />
                    <div>
                      <p className={`font-semibold text-lg ${reminder.read ? 'line-through' : ''}`}>{reminder.title}</p>
                      <p className="text-sm">{reminder.message}</p>
                      {reminder.scheduledAt && (
                        <p className="text-xs text-student-os-light-gray flex items-center space-x-1 mt-1">
                          <CalendarDays size={14} />
                          <span>Scheduled: {safeParseTimestamp(reminder.scheduledAt) ? format(safeParseTimestamp(reminder.scheduledAt), 'PPP p') : 'N/A'}</span>
                        </p>
                      )}
                      <p className="text-xs text-student-os-light-gray flex items-center space-x-1 mt-1">
                        <span>Created: {safeParseTimestamp(reminder.createdAt) ? format(safeParseTimestamp(reminder.createdAt), 'PPP p') : 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    {!reminder.read && (
                      <button
                        onClick={() => handleMarkAsDone(reminder.id)}
                        className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                        aria-label="Mark as done"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                      aria-label="Delete reminder"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemindersPage;


