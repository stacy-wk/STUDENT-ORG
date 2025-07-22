import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import Login from './pages/Auth/Login.jsx';
import Signup from './pages/Auth/Signup.jsx';
import MainLayout from './components/Layout/MainLayout.jsx';
import AcademicCalendar from './pages/Calendar/AcademicCalendar.jsx';
import TaskManager from './pages/Task/TaskManager.jsx';

// Main app
function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Firebase Init and AuthN
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const localFirebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        };

        const firebaseConfig = typeof __firebase_config !== 'undefined'
          ? JSON.parse(__firebase_config)
          : localFirebaseConfig;

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log('Firebase user signed in:', user.uid);
          } else {
            setUserId(null);
            console.log('Firebase user not signed in.');
          }
          setIsAuthReady(true);
          setLoadingFirebase(false);
        });

        return () => unsubscribe();
      } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            if (error.code === 'app/no-app' || error.message.includes('No Firebase App instance has been provided')) {
                toast.error('Firebase config missing. Please update client/.env.local with your Firebase config.');
            } else {
                toast.error('Failed to initialize application.');
            }
            setLoadingFirebase(false);
      }
    };

    initializeFirebase();
  }, []);

  // Fetch user profile once userId and auth are acquired
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthReady && userId && auth) {
        setLoadingProfile(true);
        try {
          const idToken = await auth.currentUser.getIdToken();
          console.log('Firebase ID Token obtained:', idToken.substring(0, 20) + '...');

          const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          setUserProfile(response.data);
          toast.success('User profile loaded!');
          console.log('User Profile:', response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Failed to load user profile.');
          if (error.response && error.response.status === 401) {
            console.error('Authentication required or token expired. Redirecting to login.');
            setUserId(null);
            setUserProfile(null);
          }
        } finally {
          setLoadingProfile(false);
        }
      } else if (isAuthReady && !userId) {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [userId, auth, API_BASE_URL, isAuthReady]);

  if (loadingFirebase || (isAuthReady && userId && loadingProfile)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-student-os-white text-student-os-dark-gray">
        <p className="text-lg font-inter">
          {loadingFirebase ? 'Initializing StudentOS...' : 'Loading user profile...'}
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login and Signup */}
        <Route path="/login" element={<Login auth={auth} />} />
        <Route path="/signup" element={<Signup auth={auth} db={db} />} />

        {/* Routes in MainLayout */}
        <Route
          path="/dashboard"
          element={
            isAuthReady && userId ? (
              <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
                {/* Dashboard */}
                <div className="p-4 md:p-8 flex-grow">
                  <div className="max-w-7xl mx-auto">
                    <h2 className="text-xl md:text-3xl font-bold mb-6 text-student-os-dark-gray">
                      Welcome to your StudentOS Dashboard!
                    </h2>
                    <p className="text-lg mb-4">
                      This is where your classes, assignments, and more will be organized.
                    </p>
                    <div className="bg-white rounded-xl p-6 shadow-custom-medium mt-8">
                      <h3 className="text-xl font-semibold mb-4 text-student-os-accent">
                        Your Profile
                      </h3>
                      {userProfile ? (
                        <div className="space-y-2 text-student-os-dark-gray">
                          <p><strong>ID:</strong> {userProfile.id}</p>
                          <p><strong>Email:</strong> {userProfile.email || 'N/A'}</p>
                          <p><strong>Username:</strong> {userProfile.username || 'N/A'}</p>
                          <p><strong>Created At:</strong> {userProfile.createdAt ? new Date(userProfile.createdAt._seconds * 1000).toLocaleString() : 'N/A'}</p>
                          <p><strong>Last Updated:</strong> {userProfile.updatedAt ? new Date(userProfile.updatedAt._seconds * 1000).toLocaleString() : 'N/A'}</p>
                          {userProfile.name && <p><strong>Name:</strong> {userProfile.name}</p>}
                          {userProfile.university && <p><strong>University:</strong> {userProfile.university}</p>}
                        </div>
                      ) : (
                        <p className="text-student-os-light-gray">No profile data loaded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Academic Calendar */}
        <Route
          path="/calendar"
          element={
            isAuthReady && userId ? (
              <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
                <AcademicCalendar userId={userId} auth={auth} />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Task Manager */}
        <Route
          path="/tasks"
          element={
            isAuthReady && userId ? (
              <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
                <TaskManager userId={userId} auth={auth} />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirect to dashboard if logged in, login if not */}
        <Route
          path="/"
          element={
            isAuthReady && userId ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
