import React, { useState } from 'react';
import Sidebar from '../Navigation/Sidebar.jsx';
import { Toaster } from 'react-hot-toast';
import { Menu, LogOut } from 'lucide-react'; 
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'; 
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'; 
import { Button } from '../../components/ui/button'; 
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';


function MainLayout({ children, auth, userId, userProfile }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const getInitials = (username) => {
    if (!username) return 'OS'; // Default
    const parts = username.split(' ');
    if (parts.length === 1) return username.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-64' : 'ml-0'} {/* When sidebar is open, push content */}
          md:ml-64`}
      >
        {/* Top bar for all devices */}
        <header className="bg-white shadow-custom-light p-1 flex items-center justify-between">
          {/* Hamburger icon for mobile */}
          <button
            onClick={toggleSidebar}
            className="text-student-os-dark-gray p-2 rounded-lg hover:bg-student-os-light-gray transition-colors
                       md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          {/* Title for mobile */}
          <h1 className="text-2xl font-bold text-student-os-accent md:hidden">StudentOS</h1>

          {/* Pushes avatar to right */}
          <div className="hidden md:flex flex-grow"></div> 

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost" 
                className="relative h-10 w-10 rounded-full"
                aria-label="User profile menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userProfile?.photoURL || "https://placehold.co/100x100/A0AEC0/FFFFFF?text=OS"} alt={userProfile?.username || "User"} />
                  <AvatarFallback className="bg-black text-white">
                    {getInitials(userProfile?.username || userProfile?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-white rounded-lg shadow-lg text-student-os-dark-gray z-50">
              <div className="space-y-3">
                <p className="text-lg font-semibold">{userProfile?.username || 'Student User'}</p>
                <p className="text-sm text-gray-600">{userProfile?.email || 'N/A'}</p>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Button
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                    variant="ghost"
                  >
                    <LogOut size={18} className="mr-2" /> Log Out
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </header>

        {children} {/* Main content */}

      </div>
    </div>
  );
}

export default MainLayout;
