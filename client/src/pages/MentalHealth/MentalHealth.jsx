import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  Smile, BookOpen, Loader2, Trash2, Info 
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; 


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

// Mood options 
const moodOptions = [
  { value: 1, label: 'Awful', emoji: '😞' },
  { value: 2, label: 'Bad', emoji: '😔' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '😊' },
  { value: 5, label: 'Great', emoji: '😁' },
];


function MentalHealth({ userId, userProfile, auth, isAxiosAuthReady }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [loadingMood, setLoadingMood] = useState(true);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [loadingJournal, setLoadingJournal] = useState(true);
  const [activeTab, setActiveTab] = useState('mood'); 
  const chartData = moodHistory
    .map(entry => {
      const date = safeParseTimestamp(entry.timestamp);
      const moodValue = moodOptions.find(opt => opt.label === entry.moodRating)?.value;
      return date && moodValue ? { date: format(date, 'MMM dd'), mood: moodValue } : null;
    })
    .filter(Boolean) // Remove null entries
    .sort((a, b) => new Date(a.date) - new Date(b.date)); 

  // Fetch Mood History 
  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (!userId || !isAxiosAuthReady) {
        console.log('[MentalHealth] Skipping fetchMoodHistory: userId or isAxiosAuthReady not ready.');
        return;
      }
      setLoadingMood(true);
      console.log('[MentalHealth] Attempting to fetch mood history from:', `${API_BASE_URL}/mental-health/mood`);
      try {
        const response = await axios.get(`${API_BASE_URL}/mental-health/mood`);
        setMoodHistory(response.data);
        console.log('[MentalHealth] Mood history fetched successfully.');
      } catch (error) {
        console.error('[MentalHealth] Error fetching mood history:', error);
        toast.error('Failed to load mood history.');
      } finally {
        setLoadingMood(false);
      }
    };
    fetchMoodHistory();
  }, [userId, API_BASE_URL, isAxiosAuthReady]);

  // Journal Entries 
  useEffect(() => {
    const fetchJournalEntries = async () => {
      if (!userId || !isAxiosAuthReady) {
        console.log('[MentalHealth] Skipping fetchJournalEntries: userId or isAxiosAuthReady not ready.');
        return;
      }
      setLoadingJournal(true);
      console.log('[MentalHealth] Attempting to fetch journal entries from:', `${API_BASE_URL}/mental-health/journal`);
      try {
        const response = await axios.get(`${API_BASE_URL}/mental-health/journal`);
        setJournalEntries(response.data);
        console.log('[MentalHealth] Journal entries fetched successfully.');
      } catch (error) {
        console.error('[MentalHealth] Error fetching journal entries:', error);
        toast.error('Failed to load journal entries.');
      } finally {
        setLoadingJournal(false);
      }
    };
    fetchJournalEntries();
  }, [userId, API_BASE_URL, isAxiosAuthReady]);

  // Mood Logging
  const handleLogMood = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood.');
      return;
    }
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to log mood.');
      return;
    }

    const payload = {
      moodRating: selectedMood.label, 
      notes: moodNotes,
    };
    console.log('[MentalHealth] Sending log mood request with payload:', payload);
    try {
      const response = await axios.post(`${API_BASE_URL}/mental-health/mood`, payload);
      setMoodHistory(prev => [response.data, ...prev]);
      setSelectedMood(null);
      setMoodNotes('');
      toast.success('Mood logged successfully!');
      console.log('[MentalHealth] Mood logged successfully, response:', response.data);
    } catch (error) {
      console.error('[MentalHealth] Error logging mood:', error.response?.data || error.message);
      toast.error('Failed to log mood: ' + (error.response?.data?.message || error.message));
    }
  };

  // Journaling 
  const handleCreateJournalEntry = async () => {
    if (!journalContent.trim()) {
      toast.error('Journal content cannot be empty.');
      return;
    }
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to create journal entry.');
      return;
    }

    const payload = {
      title: journalTitle.trim(),
      content: journalContent.trim(),
    };
    console.log('[MentalHealth] Sending create journal entry request with payload:', payload);
    try {
      const response = await axios.post(`${API_BASE_URL}/mental-health/journal`, payload);
      setJournalEntries(prev => [response.data, ...prev]);
      setJournalTitle('');
      setJournalContent('');
      toast.success('Journal entry saved!');
      console.log('[MentalHealth] Journal entry saved successfully, response:', response.data);
    } catch (error) {
      console.error('[MentalHealth] Error creating journal entry:', error.response?.data || error.message);
      toast.error('Failed to save journal entry: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete Journal Entry
  const handleDeleteJournalEntry = async (journalId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return; 
    }
    if (!userId || !isAxiosAuthReady) {
      toast.error('Authentication required to delete journal entry.');
      return;
    }

    console.log(`[MentalHealth] Attempting to delete journal entry with ID: ${journalId}`);
    try {
      await axios.delete(`${API_BASE_URL}/mental-health/journal/${journalId}`);
      setJournalEntries(prev => prev.filter(entry => entry.id !== journalId));
      toast.success('Journal entry deleted successfully!');
      console.log(`[MentalHealth] Journal entry ${journalId} deleted successfully.`);
    } catch (error) {
      console.error(`[MentalHealth] Error deleting journal entry ${journalId}:`, error.response?.data || error.message);
      toast.error('Failed to delete journal entry: ' + (error.response?.data?.message || error.message));
    }
  };


  
  const getMoodEmoji = (ratingLabel) => {
    const mood = moodOptions.find(opt => opt.label === ratingLabel);
    return mood ? mood.emoji : '❓';
  };

  
  const formatMoodTick = (tickItem) => {
    const mood = moodOptions.find(opt => opt.value === tickItem);
    return mood ? mood.label : '';
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto flex flex-grow w-full bg-white rounded-xl shadow-custom-medium overflow-hidden">
        {/* Tabs for nav */}
        <div className="w-full border-b border-student-os-light-gray flex flex-col">
          <div className="flex bg-student-os-dark-gray text-white rounded-t-xl overflow-hidden shadow-sm">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors
                ${activeTab === 'mood' ? 'bg-student-os-accent text-black' : 'text-black'}`}
              onClick={() => setActiveTab('mood')}
            >
              <Smile size={18} className="inline-block mr-2" /> Mood Tracker
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors
                ${activeTab === 'journal' ? 'bg-student-os-accent text-black' : 'text-black'}`}
              onClick={() => setActiveTab('journal')}
            >
              <BookOpen size={18} className="inline-block mr-2" /> Journal
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors
                ${activeTab === 'resources' ? 'bg-student-os-accent text-black' : 'text-black'}`}
              onClick={() => setActiveTab('resources')}
            >
              <Info size={18} className="inline-block mr-2" /> Resources
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-grow p-4 md:p-6 overflow-y-auto pt-6">
            {activeTab === 'mood' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-student-os-dark-gray mb-4">Log Your Mood</h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  {moodOptions.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood)}
                      className={`px-4 py-2 rounded-full border-2 transition-all duration-200 flex items-center space-x-2
                        ${selectedMood?.value === mood.value
                          ? 'bg-student-os-accent text-black border-student-os-accent shadow-md'
                          : 'bg-white text-student-os-dark-gray border-student-os-light-gray hover:border-student-os-accent'
                        }`}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="Add a few notes about why you feel this way..."
                  rows="3"
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                ></textarea>
                <button
                  onClick={handleLogMood}
                  className="w-full py-3 px-6 bg-student-os-accent text-black rounded-lg shadow-md hover:bg-student-os-accent/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Smile size={20} />
                  <span>Log Mood</span>
                </button>

                <h3 className="text-xl font-bold text-student-os-dark-gray mt-8 mb-4">Mood History</h3>
                {loadingMood ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 size={24} className="animate-spin text-student-os-accent" />
                    <p className="ml-2 text-student-os-dark-gray">Loading mood history...</p>
                  </div>
                ) : moodHistory.length === 0 ? (
                  <p className="text-student-os-light-gray">No mood entries yet. Log your first mood!</p>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-student-os-dark-gray mb-3">Mood Trend Over Time</h4>
                    <div className="bg-student-os-light-gray p-4 rounded-lg shadow-sm mb-6 h-64"> 
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} />
                          <YAxis
                            domain={[1, 5]} // Mood values
                            ticks={[1, 2, 3, 4, 5]}
                            tickFormatter={formatMoodTick}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            formatter={(value, name, props) => [formatMoodTick(value), 'Mood']}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="mood"
                            stroke="#6A67F3" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#6A67F3', stroke: '#fff', strokeWidth: 1 }}
                            activeDot={{ r: 6, fill: '#6A67F3', stroke: '#fff', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <h4 className="text-lg font-semibold text-student-os-dark-gray mb-3">Recent Mood Entries</h4>
                    <div className="space-y-3">
                      {moodHistory.map(entry => (
                        <div key={entry.id} className="bg-student-os-light-gray p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between text-student-os-dark-gray mb-2">
                            <span className="font-semibold text-lg flex items-center space-x-2">
                              {getMoodEmoji(entry.moodRating)} <span>{entry.moodRating}</span>
                            </span>
                            <span className="text-sm opacity-80">
                              {safeParseTimestamp(entry.timestamp) ? format(safeParseTimestamp(entry.timestamp), 'PPP p') : 'N/A'}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-student-os-dark-gray text-sm italic">{entry.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-student-os-dark-gray mb-4">Write a Journal Entry</h2>
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="Optional: Title your entry"
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors mb-3"
                />
                <textarea
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="What's on your mind today?"
                  rows="8"
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  required
                ></textarea>
                <button
                  onClick={handleCreateJournalEntry}
                  className="w-full py-3 px-6 bg-student-os-accent text-black rounded-lg shadow-md hover:bg-student-os-accent/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <BookOpen size={20} />
                  <span>Save Entry</span>
                </button>

                <h3 className="text-xl font-bold text-student-os-dark-gray mt-8 mb-4">Your Journal Entries</h3>
                {loadingJournal ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 size={24} className="animate-spin text-student-os-accent" />
                    <p className="ml-2 text-student-os-dark-gray">Loading journal entries...</p>
                  </div>
                ) : journalEntries.length === 0 ? (
                  <p className="text-student-os-light-gray">No journal entries yet. Start writing!</p>
                ) : (
                  <div className="space-y-4">
                    {journalEntries.map(entry => (
                      <div key={entry.id} className="bg-student-os-light-gray p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between text-student-os-dark-gray mb-2">
                          <h4 className="font-semibold text-lg">{entry.title || 'Untitled Entry'}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm opacity-80">
                              {safeParseTimestamp(entry.timestamp) ? format(safeParseTimestamp(entry.timestamp), 'PPP p') : 'N/A'}
                            </span>
                            <button
                              onClick={() => handleDeleteJournalEntry(entry.id)}
                              className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                              aria-label={`Delete journal entry "${entry.title || 'Untitled'}"`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-student-os-dark-gray text-sm">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-6 py-2">
                <h2 className="text-2xl font-bold text-student-os-dark-gray mb-4">Mental Wellness Resources</h2>
                <p className="text-student-os-dark-gray mb-4">
                  Here are some general tips and resources to support your mental well-being. Remember, these are not a substitute for professional help. If you are struggling, please reach out to a qualified professional.
                </p>

                <div className="bg-student-os-light-gray p-5 rounded-lg shadow-sm space-y-4">
                  <h3 className="text-xl font-semibold text-student-os-accent">Quick Tips for Well-being:</h3>
                  <ul className="list-disc list-inside space-y-2 text-student-os-dark-gray">
                    <li>Stay Connected: Reach out to friends, family, or mentors. Social connection is vital.</li>
                    <li>Mindful Movement: Even short walks can clear your head. Find activities you enjoy.</li>
                    <li>Prioritize Sleep: Aim for consistent sleep patterns. Quality sleep impacts mood significantly.</li>
                    <li>Healthy Eating: Fuel your body with nutritious food.</li>
                    <li>Limit Screen Time: Especially before bed, reduce exposure to screens.</li>
                    <li>Set Boundaries: Learn to say no to commitments that overwhelm you.</li>
                    <li>Deep Breathing: When stressed, try a simple breathing exercise (e.g., 4-7-8 method).</li>
                  </ul>
                </div>

                <div className="bg-student-os-light-gray p-5 rounded-lg shadow-sm space-y-4">
                  <h3 className="text-xl font-semibold text-student-os-accent">Finding Support in Kenya:</h3>
                  <p className="text-student-os-dark-gray">
                    It's important to find local resources tailored to your specific needs. Here are some general avenues and known organizations in Kenya:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-student-os-dark-gray">
                    <li>
                      Kenya Association of Professional Counsellors (KAPC): While not a direct helpline, KAPC is a professional body that can help you find qualified counsellors in Kenya. You can search for their directory or contact information online.
                      <a href="https://www.kapc.or.ke/" target="_blank" rel="noopener noreferrer" className="text-student-os-accent hover:underline ml-2">kapc.or.ke</a>
                    </li>
                    <li>
                      Befrienders Kenya: Provides emotional support to those in distress, with a focus on suicide prevention. They often have helplines available.
                      <a href="https://befrienders.org/find-support-now/befrienders-kenya/" target="_blank" rel="noopener noreferrer" className="text-student-os-accent hover:underline ml-2">befrienderskenya.org</a>
                    </li>
                    <li>
                      Your University Counseling Services: Most universities in Kenya offer free or low-cost counseling and mental health support for students. This is often the most accessible and relevant resource. Check your university's official website for their specific services and contact details.
                    </li>
                    <li>
                      Local Hospitals & Health Centers: Many public and private hospitals have mental health departments or can refer you to appropriate services.
                    </li>
                    <li>
                      General Emergency Services: In a life-threatening emergency, always contact your local emergency services (e.g., police, ambulance).
                    </li>
                  </ul>
                  <p className="text-sm text-red-600 font-semibold mt-4">
                    Disclaimer: This information is for educational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition. Information on external organizations may change; please verify their current contact details and services.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentalHealth;
