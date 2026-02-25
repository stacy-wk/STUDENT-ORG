import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'; 


function AcademicCalendar({ userId, auth }) {
  const [events, setEvents] = useState([]); 
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [showAddEventModal, setShowAddEventModal] = useState(false); 
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'), // Default to today's date
    time: '',
    description: ''
  });
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); 
  const [eventToDelete, setEventToDelete] = useState(null); 

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userId || !auth) return; 

      try {
        const idToken = await auth.currentUser.getIdToken();
        console.log('[Client] Fetching events...');
        const response = await axios.get(`${API_BASE_URL}/calendar/events`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setEvents(response.data);
        console.log('[Client] Fetched calendar events:', response.data);
      } catch (error) {
        console.error('[Client] Error fetching calendar events:', error);
        toast.error('Failed to load calendar events.');
      }
    };

    fetchEvents();
  }, [userId, auth, API_BASE_URL]); // Re-fetch when userId or auth changes

  // Calendar Grid
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate leading blank days for the calendar grid
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayIndex = firstDayOfMonth.getDay(); 
  const leadingBlanks = Array.from({ length: startingDayIndex }, (_, i) => null);

  // Combine leading blanks with actual days
  const calendarDays = [...leadingBlanks, ...daysInMonth];

  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!userId || !auth) {
      toast.error('You must be logged in to add events.');
      return;
    }
    if (!newEvent.title || !newEvent.date) {
      toast.error('Title and Date are required for an event.');
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log('[Client] Adding new event:', newEvent);
      const response = await axios.post(`${API_BASE_URL}/calendar/events`, newEvent, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setEvents(prev => [...prev, response.data]); 
      toast.success('Event added successfully!');
      setShowAddEventModal(false); // Close modal
      setNewEvent({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        type: 'assignment',
        description: '',
      });
      console.log('[Client] Event added, response:', response.data);
    } catch (error) {
      console.error('[Client] Error adding event:', error);
      toast.error('Failed to add event.');
    }
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event); // Store event to be deleted
    setShowConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete || !userId || !auth) {
      toast.error('Could not delete event. Missing information.');
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log(`[Client] Deleting event with ID: ${eventToDelete.id}`);
      await axios.delete(`${API_BASE_URL}/calendar/events/${eventToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      // Remove event from client-side state
      setEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
      toast.success('Event deleted successfully!');
      setShowConfirmDeleteModal(false); 
      setEventToDelete(null); 
    } catch (error) {
      console.error('[Client] Error deleting event:', error);
      toast.error('Failed to delete event.');
    }
  };

  // Nav for Months
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  useEffect(() => {
    console.log('[Client Debug] Current events in state:', events);
    console.log('[Client Debug] Calendar days generated:', calendarDays.filter(Boolean).map(d => format(d, 'yyyy-MM-dd')));
  }, [events, calendarDays]);


  return (
    <div className="flex-grow p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Calendar Nav */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-custom-light">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-student-os-accent text-black hover:bg-student-os-accent/90 transition-colors shadow-sm"
            aria-label="Previous Month"
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-2xl font-semibold text-student-os-dark-gray">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-student-os-accent text-black hover:bg-student-os-accent/90 transition-colors shadow-sm"
            aria-label="Next Month"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 bg-white rounded-xl shadow-custom-medium p-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-student-os-accent py-2 border-b border-student-os-light-gray">
              {day}
            </div>
          ))}

          {/* Days of the Month */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-student-os-light-gray flex flex-col items-start rounded-md
                ${day && isSameMonth(day, currentMonth) ? 'bg-student-os-white' : 'bg-student-os-light-gray/30'}
                ${day && isSameDay(day, new Date()) ? 'border-2 border-student-os-accent bg-student-os-accent/10' : ''}
              `}
            >
              {day && (
                <>
                  <span className={`font-bold ${isSameDay(day, new Date()) ? 'text-student-os-accent' : 'text-student-os-dark-gray'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="text-xs mt-1 space-y-0.5 w-full">
                    {events
                      .filter(event => {
                        const eventDate = startOfDay(new Date(event.date));
                        const calendarDay = startOfDay(day);
                        return isSameDay(eventDate, calendarDay);
                      })
                      .map(event => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between bg-student-os-accent text-student-os-white px-1.5 py-0.5 rounded-md truncate group relative"
                        >
                          <span className="truncate pr-6">{event.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); 
                              handleDeleteEvent(event);
                            }}
                            className="absolute right-0 top-0 bottom-0 px-1.5 flex items-center justify-center
                                       bg-student-os-dark-gray hover:bg-gray-300 rounded-r-md transition-colors"
                            aria-label={`Delete ${event.title}`}
                          >
                            <Trash2 size={14} className="text-black" />
                          </button>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add Event Btn */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAddEventModal(true)}
            className="px-6 py-3 rounded-xl bg-student-os-accent text-black text-lg font-semibold hover:bg-student-os-accent/90 transition-colors shadow-lg"
          >
            + Add New Event
          </button>
        </div>

        {/* Add Event Modal */}
        {showAddEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-custom-medium p-6 w-full max-w-md">
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-student-os-dark-gray mb-1">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-student-os-dark-gray mb-1">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-student-os-dark-gray mb-1">Time (Optional)</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-student-os-dark-gray mb-1">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={newEvent.type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="lecture">Lecture</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-student-os-dark-gray mb-1">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className="px-5 py-2 rounded-lg border border-student-os-light-gray text-student-os-dark-gray hover:bg-student-os-light-gray transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-student-os-accent text-black hover:bg-student-os-accent/90 transition-colors shadow-md"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showConfirmDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-custom-medium p-6 w-full max-w-sm text-center">
          
              <p className="mb-6 text-student-os-dark-gray">
                Are you sure you want to delete the event: <span className="font-semibold">"{eventToDelete?.title}"</span>?
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

export default AcademicCalendar;
