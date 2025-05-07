import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Tabs } from 'flowbite-react';
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
    <div className="flex min-h-screen bg-gray-100">
      <UnifiedSidebar /> {/* Sidebar */}
      <div className="flex-1 p-4 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Simple tab navigation */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => handleTabChange('profile')}
            className={`px-4 py-2 ${tab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
          >
            <HiUserCircle className="inline mr-2" /> Profile
          </button>
          <button
            onClick={() => handleTabChange('displaypost')}
            className={`px-4 py-2 ${tab === 'displaypost' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
          >
            <HiDocumentText className="inline mr-2" /> My Posts
          </button>
        </div>
        
        {/* Render content based on the tab */}
        {tab === 'displaypost' && <DisplayPosts isDashboard={true} />}
        {tab === 'profile' && <Profile />}
        {tab !== 'displaypost' && tab !== 'profile' && (
          <div className="text-center text-gray-500 p-10">
            <p>Invalid tab selected. Please choose a valid option from the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
}