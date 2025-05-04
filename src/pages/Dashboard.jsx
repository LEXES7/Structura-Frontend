import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UnifiedSidebar from '../components/DashSidebar';
import DisplayPosts from '../components/DisplayPosts/DisplayPosts';




import Profile from './Profile';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      // Default to "profile" tab if no tab is specified
      setTab('profile');
      navigate('/dashboard?tab=profile', { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UnifiedSidebar /> {/* Sidebar */}
      <div className="flex-1 p-4">
        {/* Render content based on the tab */}
        {tab === 'displaypost' && <DisplayPosts isDashboard={true} />}
       
        {tab === 'profile' && <Profile />}









        
        {tab !== 'displaypost'   && tab !== 'profile' && (
          <div className="text-center text-gray-500">
            <p>Invalid tab selected. Please choose a valid option from the sidebar.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}