import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth'; 
import { toast } from 'react-hot-toast'; 
import { Home, Calendar, Heart, Bell, Users, DollarSign, ListTodo, LogOut, X } from 'lucide-react';


function Sidebar({ isOpen, toggleSidebar, auth, userId, userProfile }) {
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Academic Calendar', path: '/calendar', icon: Calendar },
    { name: 'Mental Health', path: '/mental-health', icon: Heart },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Study Groups', path: '/groups', icon: Users },
    { name: 'Finance Tracker', path: '/finance', icon: DollarSign },
    { name: 'Task Manager', path: '/tasks', icon: ListTodo }, // New Task Manager link
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      toast.success('Logged out successfully!');
      navigate('/login'); 
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-custom-medium transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`} 
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-student-os-accent">StudentOS</h1>
          </Link>
          <button onClick={toggleSidebar} className="md:hidden text-student-os-dark-gray p-2 rounded-lg hover:bg-student-os-light-gray transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>

        {/* User Info */}
        {userId && (
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-student-os-light-gray rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-semibold text-student-os-dark-gray">
              {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : (userId ? userId.charAt(0).toUpperCase() : '?')}
            </div>
            <p className="font-semibold text-student-os-dark-gray">{userProfile?.username || 'Student'}</p>
            <p className="text-xs text-student-os-light-gray">{userProfile?.email || 'N/A'}</p>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-grow space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={toggleSidebar} 
              className="flex items-center space-x-3 p-3 rounded-lg text-student-os-dark-gray hover:bg-student-os-light-gray hover:text-student-os-accent transition-colors duration-200 group"
            >
              <link.icon size={20} className="text-student-os-dark-gray group-hover:text-student-os-accent transition-colors" />
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Btn */}
        <div className="mt-auto pt-4 border-t border-student-os-light-gray">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
