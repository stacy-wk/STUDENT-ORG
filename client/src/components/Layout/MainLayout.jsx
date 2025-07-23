import React, { useState } from 'react';
import Sidebar from '../Navigation/Sidebar.jsx'; 
import { Toaster } from 'react-hot-toast'; 


function MainLayout({ children, auth, userId, userProfile }) {
  // Control sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-student-os-white font-inter text-student-os-dark-gray">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        auth={auth} 
        userId={userId} 
        userProfile={userProfile} 
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-64 md:ml-0' : 'ml-0'}
          md:ml-64`}
      >
        {/* Top bar for mobile */}
        <header className={`bg-white shadow-custom-light p-4 flex items-center justify-between rounded-b-xl md:hidden
          ${isSidebarOpen ? 'hidden' : 'flex'}`} 
        >
          <button onClick={toggleSidebar} className="text-student-os-dark-gray p-2 rounded-lg hover:bg-student-os-light-gray transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-student-os-accent">StudentOS</h1>
          {userId && (
            <div className="text-sm text-student-os-dark-gray">
              <span className="font-medium">{userProfile?.username || userId?.substring(0, 8) + '...'}</span>
            </div>
          )}
        </header>

        {children}

        {/* Footer */}
        <footer className="bg-white shadow-inner p-4 text-center text-sm text-student-os-light-gray rounded-t-xl mt-auto">
          &copy; {new Date().getFullYear()} StudentOS. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;
