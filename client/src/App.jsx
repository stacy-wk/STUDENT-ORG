import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; 
import { toast } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom'; 

import AppContent from './AppContent.jsx'; 

function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [loadingFirebaseInit, setLoadingFirebaseInit] = useState(true); 

  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    console.log('ENV DEBUG:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    allViteKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
  });

    console.log('App useEffect: Firebase Initialization running...');
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
        setLoadingFirebaseInit(false); 
        console.log('Firebase initialized successfully.');

      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        if (error.code === 'app/no-app' || error.message.includes('No Firebase App instance has been provided')) {
          toast.error('Firebase config missing. Please update client/.env.local with your Firebase config.');
        } else {
          toast.error('Failed to initialize application.');
        }
        setLoadingFirebaseInit(false); 
      }
    };

    initializeFirebase();
  }, []); 

  if (loadingFirebaseInit) {
    console.log('App Render: Showing initial Firebase loading screen.');
    return (
      <div className="flex items-center justify-center min-h-screen bg-student-os-white text-student-os-dark-gray">
        <p className="text-lg font-inter">Initializing StudentOrg...</p>
      </div>
    );
  }

  if (!auth || !db) {
    console.error('Firebase auth or db not initialized, cannot render AppContent.');
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800">
        <p className="text-lg font-inter">Error: Firebase initialization failed. Please check console.</p>
      </div>
    );
  }

  console.log('App Render: Firebase initialized, rendering AppContent.');
  return (
    <Router>
      <AppContent auth={auth} db={db} />
    </Router>
  );
}

export default App;
