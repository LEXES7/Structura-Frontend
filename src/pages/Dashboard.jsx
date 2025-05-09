import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiUserCircle, HiDocumentText, HiCalendar, HiChartPie } from 'react-icons/hi';
import UnifiedSidebar from '../components/DashSidebar';
import DisplayPosts from '../components/DisplayPosts/DisplayPosts';
import Profile from './Profile';
import EventCalendar from '../components/DisplayEvents/EventCalendar';
import UserLanding from './userlanding';

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
      // Default to "overview" tab instead of "profile"
      setTab('overview');
      navigate('/dashboard?tab=overview', { replace: true });
    }
  }, [location.search, navigate, currentUser]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    navigate(`/dashboard?tab=${newTab}`, { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UnifiedSidebar /> {/* Sidebar */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h1>
        
        {/* Enhanced tab navigation with light theme styling */}
        <div className="flex mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-6 py-3 transition-all duration-200 whitespace-nowrap ${
              tab === 'overview' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <HiChartPie className="inline mr-2 h-5 w-5" /> Overview
          </button>
          <button
            onClick={() => handleTabChange('profile')}
            className={`px-6 py-3 transition-all duration-200 whitespace-nowrap ${
              tab === 'profile' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <HiUserCircle className="inline mr-2 h-5 w-5" /> Profile
          </button>
          <button
            onClick={() => handleTabChange('displaypost')}
            className={`px-6 py-3 transition-all duration-200 whitespace-nowrap ${
              tab === 'displaypost' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <HiDocumentText className="inline mr-2 h-5 w-5" /> My Posts
          </button>
          <button
            onClick={() => handleTabChange('events')}
            className={`px-6 py-3 transition-all duration-200 whitespace-nowrap ${
              tab === 'events' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <HiCalendar className="inline mr-2 h-5 w-5" /> Event Calendar
          </button>
        </div>
        
        {/* Content wrapper with light styling */}
        <div className={`bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 ${
          tab === 'events' || tab === 'overview' ? 'p-0' : ''
        }`}>
          {/* Render content based on the tab */}
          {tab === 'overview' && <UserLanding />}
          {tab === 'displaypost' && <DisplayPosts isDashboard={true} />}
          {tab === 'profile' && (
            <div className="bg-white p-0 rounded-lg">
              <Profile />
            </div>
          )}
          {tab === 'events' && (
            <div className="bg-white p-0 rounded-lg">
              <EventCalendar isAdminView={false} />
            </div>
          )}
          {tab !== 'overview' && tab !== 'displaypost' && tab !== 'profile' && tab !== 'events' && (
            <div className="text-center text-gray-700 p-10">
              <p>Invalid tab selected. Please choose a valid option from the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}