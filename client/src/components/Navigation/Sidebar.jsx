import React from 'react';
import { Link } from 'react-router-dom'; 
import { Home, Calendar, Heart, Bell, Users, DollarSign, ListTodo, X } from 'lucide-react'; 

function Sidebar({ isOpen, toggleSidebar }) { 

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Academic Calendar', path: '/calendar', icon: Calendar },
    { name: 'Mental Health', path: '/mental-health', icon: Heart },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Chat Groups', path: '/chat', icon: Users },
    { name: 'Finance Tracker', path: '/finance', icon: DollarSign },
    { name: 'Task Manager', path: '/tasks', icon: ListTodo },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-custom-medium transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`} 
    >
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="p-6 flex flex-col h-full relative z-50"> 
        <div className="flex items-center justify-between mb-8">
          <Link className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-student-os-accent">StudentOrg</h1>
          </Link>
        </div>


        {/* Nav Links */}
        <nav className="flex-grow space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={toggleSidebar} // Close sidebar on mobile after clicking a link
              className="flex items-center space-x-3 p-3 rounded-lg text-student-os-dark-gray hover:bg-student-os-light-gray hover:text-student-os-accent transition-colors duration-200 group"
            >
              <link.icon size={20} className="text-student-os-dark-gray group-hover:text-student-os-accent transition-colors" />
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>

      </div>
    </aside>
  );
}

export default Sidebar;
