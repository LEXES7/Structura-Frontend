import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiUserCircle, HiDocumentText } from 'react-icons/hi';
import UnifiedSidebar from '../components/DashSidebar';
import DisplayPosts from '../components/DisplayPosts/DisplayPosts';
import Profile from './Profile';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      // Default to "profile" tab if no tab is specified
      setTab('profile');
      navigate('/dashboard?tab=profile', { replace: true });
    }
  }, [location.search, navigate, currentUser]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    navigate(`/dashboard?tab=${newTab}`, { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <UnifiedSidebar /> {/* Sidebar */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
        
        {/* Enhanced tab navigation with dark theme styling */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => handleTabChange('profile')}
            className={`px-6 py-3 transition-all duration-200 ${
              tab === 'profile' 
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <HiUserCircle className="inline mr-2 h-5 w-5" /> Profile
          </button>
          <button
            onClick={() => handleTabChange('displaypost')}
            className={`px-6 py-3 transition-all duration-200 ${
              tab === 'displaypost' 
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <HiDocumentText className="inline mr-2 h-5 w-5" /> My Posts
          </button>
        </div>
        
        {/* Content wrapper with dark styling */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Render content based on the tab */}
          {tab === 'displaypost' && <DisplayPosts isDashboard={true} />}
          {tab === 'profile' && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <Profile />
            </div>
          )}
          {tab !== 'displaypost' && tab !== 'profile' && (
            <div className="text-center text-gray-300 p-10">
              <p>Invalid tab selected. Please choose a valid option from the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}