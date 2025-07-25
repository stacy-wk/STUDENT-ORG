import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import Login from './pages/Auth/Login.jsx';
import Signup from './pages/Auth/Signup.jsx';
import MainLayout from './components/Layout/MainLayout.jsx';
import AcademicCalendar from './pages/Calendar/AcademicCalendar.jsx';
import TaskManager from './pages/Task/TaskManager.jsx';
import Chat from './pages/Chat/Chat.jsx';
import MentalHealth from './pages/MentalHealth/MentalHealth.jsx';
import FinanceTracker from './pages/Finance/FinanceTracker.jsx';
import RemindersPage from './pages/Reminders/RemindersPage.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';

function AppContent({ auth, db }) { 
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAxiosAuthReady, setIsAxiosAuthReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  console.log('--- AppContent Render ---');
  console.log(`loadingFirebase: ${loadingFirebase}, isAuthReady: ${isAuthReady}, userId: ${userId}, loadingProfile: ${loadingProfile}, isAxiosAuthReady: ${isAxiosAuthReady}`);


  
  useEffect(() => {
    console.log('AppContent useEffect: Firebase Auth Listener running...');
    if (!auth) {
      console.warn('Auth object not available in AppContent yet.');
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('Firebase user signed in:', user.uid);
      } else {
        setUserId(null);
        console.log('Firebase user not signed in.');
      }
      setIsAuthReady(true);
      setLoadingFirebase(false);
      console.log(`onAuthStateChanged: isAuthReady set to true, userId: ${user?.uid || 'null'}`);
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
          console.log('Axios default Authorization header updated with fresh ID token.');
          setIsAxiosAuthReady(true);
          console.log('onIdTokenChanged: isAxiosAuthReady set to true (user present).');
        } catch (error) {
          console.error('Error getting fresh ID token:', error);
          setIsAxiosAuthReady(false);
          console.log('onIdTokenChanged: isAxiosAuthReady set to false (token error).');
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
        console.log('Axios default Authorization header cleared.');
        setIsAxiosAuthReady(true);
        console.log('onIdTokenChanged: isAxiosAuthReady set to true (no user).');
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [auth]);

  // Fetch User Profile
  useEffect(() => {
    console.log('AppContent useEffect: Fetch User Profile running...');
    console.log(`  Conditions: isAuthReady=${isAuthReady}, userId=${userId}, auth=${!!auth}, isAxiosAuthReady=${isAxiosAuthReady}`);

    const fetchUserProfile = async () => {
      if (isAuthReady && userId && auth && isAxiosAuthReady) {
        setLoadingProfile(true);
        console.log('  Attempting to fetch user profile...');
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/profile`);
          setUserProfile(response.data);
          console.log('  User Profile fetched successfully:', response.data);
        } catch (error) {
          console.error('  Error fetching user profile:', error);
          if (error.response && error.response.status === 404) {
            console.log('  Profile not found (404). This is expected if the profile was just created or doesn\'t exist yet.');
            setUserProfile(null); 
          } else {
            toast.error('Failed to load user profile.');
          }
          if (error.response && error.response.status === 401) {
            console.error('  Authentication required or token expired. Redirecting to login.');
            setUserId(null);
            setUserProfile(null);
          }
        } finally {
          setLoadingProfile(false);
          console.log('  setLoadingProfile(false) called.');
        }
      } else if (isAuthReady && !userId && isAxiosAuthReady) {
        console.log('  No user logged in, setting loadingProfile to false.');
        setLoadingProfile(false);
      } else {
        console.log('  Conditions for fetching user profile not met yet.');
      }
    };

    fetchUserProfile();
  }, [userId, auth, API_BASE_URL, isAuthReady, isAxiosAuthReady]);

  // Navigation
  useEffect(() => {
    console.log('AppContent useEffect: Navigation logic running...');
    console.log(`  Nav Conditions: isAuthReady=${isAuthReady}, userId=${userId}, loadingProfile=${loadingProfile}, location.pathname=${location.pathname}`);

    if (isAuthReady && userId && !loadingProfile && isAxiosAuthReady) {
      if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
        console.log('  Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      }
    } else if (isAuthReady && !userId && isAxiosAuthReady) {
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        console.log('  User not logged in, redirecting to login...');
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthReady, userId, loadingProfile, isAxiosAuthReady, location.pathname, navigate]);


  // Loading screen
  if (loadingFirebase || (isAuthReady && userId && loadingProfile) || !isAxiosAuthReady) {
    console.log('AppContent Render: Showing loading screen.');
    return (
      <div className="flex items-center justify-center min-h-screen bg-student-os-white text-student-os-dark-gray">
        <p className="text-lg font-inter">
          {loadingFirebase ? 'Initializing StudentOrg...' : 'Loading user profile...'}
        </p>
      </div>
    );
  }

  console.log('AppContent Render: All loading conditions met, rendering main content.');
  return (
    <Routes>
      <Route path="/login" element={<Login auth={auth} />} />
      <Route path="/signup" element={<Signup auth={auth} db={db} />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          isAuthReady && userId ? (
            <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
              <Dashboard userId={userId} userProfile={userProfile} isAxiosAuthReady={isAxiosAuthReady} />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

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

      <Route
        path="/chat"
        element={
          isAuthReady && userId ? (
            <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
              <Chat userId={userId} userProfile={userProfile} auth={auth} isAxiosAuthReady={isAxiosAuthReady} />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

    
      <Route
        path="/mental-health"
        element={
          isAuthReady && userId ? (
            <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
              <MentalHealth userId={userId} userProfile={userProfile} auth={auth} isAxiosAuthReady={isAxiosAuthReady} />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/finance"
        element={
          isAuthReady && userId ? (
            <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
              <FinanceTracker userId={userId} userProfile={userProfile} isAxiosAuthReady={isAxiosAuthReady} />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/reminders"
        element={
          isAuthReady && userId ? (
            <MainLayout auth={auth} userId={userId} userProfile={userProfile}>
              <RemindersPage userId={userId} userProfile={userProfile} isAxiosAuthReady={isAxiosAuthReady} />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Root path redirect */}
      <Route path="/" element={<div />} />
    </Routes>
  );
}

export default AppContent;
