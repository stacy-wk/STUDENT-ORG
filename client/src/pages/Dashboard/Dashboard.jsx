import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { format, isToday, isFuture, parseISO, isValid } from 'date-fns';
import { CalendarDays, ListTodo, Bell, Smile, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';


const safeParseTimestamp = (timestampValue) => {
  if (!timestampValue) {
    return null;
  }
  if (typeof timestampValue === 'object' && timestampValue.seconds !== undefined) {
    const date = new Date(timestampValue.seconds * 1000);
    return isValid(date) ? date : null;
  }
  if (typeof timestampValue === 'string') {
    const date = new Date(timestampValue); // ISO string from backend
    return isValid(date) ? date : null;
  }
  if (timestampValue instanceof Date && isValid(timestampValue)) {
    return timestampValue;
  }
  return null;
};


const moodOptions = [
  { value: 1, label: 'Awful', emoji: '😞' },
  { value: 2, label: 'Bad', emoji: '😔' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '😊' },
  { value: 5, label: 'Great', emoji: '😁' },
];


function Dashboard({ userId, userProfile, isAxiosAuthReady }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId || !isAxiosAuthReady) {
        console.log('[Dashboard] Skipping data fetch: userId or isAxiosAuthReady not ready.');
        return;
      }
      setLoadingDashboard(true);
      try {
        // Fetch Upcoming Events
        const eventsResponse = await axios.get(`${API_BASE_URL}/api/calendar/events`);
        const filteredEvents = eventsResponse.data
          .map(event => ({
            ...event,
            start: safeParseTimestamp(event.start),
            end: safeParseTimestamp(event.end)
          }))
          .filter(event => event.start && isFuture(event.start)) 
          .sort((a, b) => a.start.getTime() - b.start.getTime()) 
          .slice(0, 3);
        setUpcomingEvents(filteredEvents);
        console.log('[Dashboard] Upcoming events fetched:', filteredEvents);

        // Fetch Upcoming Tasks
        const tasksResponse = await axios.get(`${API_BASE_URL}/api/tasks`);
        const filteredTasks = tasksResponse.data
          .map(task => ({
            ...task,
            dueDate: safeParseTimestamp(task.dueDate)
          }))
          .filter(task => !task.completed && task.dueDate && isFuture(task.dueDate)) 
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) 
          .slice(0, 3);
        setUpcomingTasks(filteredTasks);
        console.log('[Dashboard] Upcoming tasks fetched:', filteredTasks);

        // Fetch Upcoming Reminders
        const remindersResponse = await axios.get(`${API_BASE_URL}/api/notifications`, { params: { type: 'reminder', read: 'false' } });
        const filteredReminders = remindersResponse.data
          .map(reminder => ({
            ...reminder,
            scheduledAt: safeParseTimestamp(reminder.scheduledAt)
          }))
          .filter(reminder => reminder.scheduledAt && isFuture(reminder.scheduledAt)) 
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()) 
          .slice(0, 3); 
        setUpcomingReminders(filteredReminders);
        console.log('[Dashboard] Upcoming reminders fetched:', filteredReminders);

      } catch (error) {
        console.error('[Dashboard] Error fetching dashboard data:', error.response?.data || error.message);
        // toast.error('Failed to load some dashboard data.');
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
    // Refresh interval
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000); 
    return () => clearInterval(interval); 
  }, [userId, API_BASE_URL, isAxiosAuthReady]);

  
  const getLastMood = () => {
    return null; 
  };

  const lastMood = getLastMood();
  const username = userProfile?.username || 'Student'; 

  return (
    <div className="flex-grow p-4 md:p-8 flex flex-col h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-student-os-dark-gray mb-6">
          Hi, {username}! 
        </h2>

        {loadingDashboard ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 size={32} className="animate-spin text-student-os-accent" />
            <p className="ml-3 text-lg text-student-os-dark-gray">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Mood Tracker Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-student-os-accent">
                  <Smile size={24} />
                  <span>How are you feeling today?</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Quickly log your current mood.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-student-os-dark-gray">
                  Take a moment to check in with yourself.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link to="/mental-health" className="w-full">
                  <Button className="w-full bg-white hover:bg-student-os-accent/90 text-black">
                    Log Mood <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Upcoming Events Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-student-os-accent">
                  <CalendarDays size={24} />
                  <span>Upcoming Events</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Important dates from your academic calendar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingEvents.map(event => (
                      <li key={event.id} className="border-b border-purple-200 pb-2 last:border-b-0">
                        <p className="font-semibold text-student-os-dark-gray">{event.title}</p>
                        <p className="text-sm text-gray-700">
                          {event.start ? format(event.start, 'MMM dd, yyyy - p') : 'No date'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-student-os-light-gray">No upcoming events.</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link to="/calendar" className="w-full">
                  <Button className="w-full bg-white hover:bg-student-os-accent/90 text-black">
                    View Calendar <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Upcoming Tasks Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-student-os-accent">
                  <ListTodo size={24} />
                  <span>Upcoming Tasks</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your most urgent assignments and to-dos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingTasks.map(task => (
                      <li key={task.id} className="border-b border-green-200 pb-2 last:border-b-0">
                        <p className="font-semibold text-student-os-dark-gray">{task.title}</p>
                        <p className="text-sm text-gray-700">
                          Due: {task.dueDate ? format(task.dueDate, 'MMM dd, yyyy') : 'No due date'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-student-os-light-gray">No upcoming tasks.</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link to="/tasks" className="w-full">
                  <Button className="w-full bg-white hover:bg-student-os-accent/90 text-black">
                    View Tasks <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Upcoming Reminders Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-student-os-accent">
                  <Bell size={24} />
                  <span>Upcoming Reminders</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Personal reminders you've set.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingReminders.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingReminders.map(reminder => (
                      <li key={reminder.id} className="border-b border-orange-200 pb-2 last:border-b-0">
                        <p className="font-semibold text-student-os-dark-gray">{reminder.title}</p>
                        <p className="text-sm text-gray-700">
                          {reminder.scheduledAt ? format(reminder.scheduledAt, 'MMM dd, yyyy - p') : 'No date'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-student-os-light-gray">No upcoming reminders.</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link to="/reminders" className="w-full">
                  <Button className="w-full bg-white hover:bg-student-os-accent/90 text-black">
                    View Reminders <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Finance Summary Card */}
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-student-os-accent">
                  <DollarSign size={24} />
                  <span>Financial Snapshot</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Quick glance at your finances.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-student-os-dark-gray">
                  Check your income, expenses, and balance.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link to="/finance" className="w-full">
                  <Button className="w-full bg-white hover:bg-student-os-accent/90 text-black">
                    View Finances <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
