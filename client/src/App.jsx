// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your new Login and Signup components
import Login from './pages/Auth/Login.jsx';
import Signup from './pages/Auth/Signup.jsx';

// Placeholder for your main application Dashboard component
const Dashboard = ({ userId, userProfile }) => {
  return (
    <div className="flex-grow p-4 md:p-8">
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
  );
};


// Main application component
function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Effect for Firebase Initialization and Authentication
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // IMPORTANT: THESE VALUES HAVE BEEN UPDATED WITH YOUR ACTUAL FIREBASE CONFIG
        // BASED ON THE INFORMATION YOU PROVIDED.
        const localFirebaseConfig = {
          apiKey: "AIzaSyByfW9PmMSrPI44R1w2TyEFveB9doqgoDo",
          authDomain: "studentos-d1401.firebaseapp.com",
          projectId: "studentos-d1401",
          storageBucket: "studentos-d1401.firebasestorage.app",
          messagingSenderId: "957378337405",
          appId: "1:957378337405:web:dede5b38ab48f7221faf14",
          measurementId: "G-4SQ9MWGSRH" // Optional, if you enabled Google Analytics
        };
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

        const firebaseConfig = typeof __firebase_config !== 'undefined'
          ? JSON.parse(__firebase_config)
          : localFirebaseConfig;

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
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
                toast.error('Firebase config missing. Please update App.jsx with your local Firebase config.');
            } else {
                toast.error('Failed to initialize application.');
            }
            setLoadingFirebase(false);
      }
    };

    initializeFirebase();
  }, []);

  // Effect for fetching user profile once userId and auth are available AND auth is ready
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
      <div className="min-h-screen bg-student-os-white font-inter text-student-os-dark-gray flex flex-col">
        <Toaster position="top-right" reverseOrder={false} />

        {userId && (
          <header className="bg-white shadow-custom-light p-4 flex items-center justify-between rounded-b-xl">
            <h1 className="text-2xl font-bold text-student-os-accent">StudentOS</h1>
            <div className="text-sm text-student-os-dark-gray">
              User ID: <span className="font-medium">{userId}</span>
            </div>
          </header>
        )}

        <Routes>
          <Route path="/login" element={<Login auth={auth} />} />
          <Route path="/signup" element={<Signup auth={auth} db={db} />} />

          <Route
            path="/dashboard"
            element={
              isAuthReady && userId ? (
                <Dashboard userId={userId} userProfile={userProfile} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
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

        {userId && (
          <footer className="bg-white shadow-inner p-4 text-center text-sm text-student-os-light-gray rounded-t-xl mt-8">
            &copy; {new Date().getFullYear()} StudentOS. All rights reserved.
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;
