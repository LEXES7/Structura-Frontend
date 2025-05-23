import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextInput, Spinner } from 'flowbite-react';
import { HiUsers, HiAcademicCap, HiDocumentText, HiSearch, HiStar, HiCalendar } from 'react-icons/hi';
import DashSidebar from '../components/DashSidebar';
import ShowUsers from '../components/admin/showusers';
import ShowPosts from '../components/admin/showposts';
import ShowLearn from '../components/admin/showlearn';
import ShowLesson from '../components/admin/showlesson';
import DisplayCourses from '../components/DisplayCourses/DisplayCourses';
import AdminReview from '../components/admin/adminreview';
import AdminLanding from '../components/admin/adminlanding';
import AddEventForm from '../components/Addevents/AddEventForm';
import EventCalendar from '../components/DisplayEvents/EventCalendar';

export default function Admindash() {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is admin
    if (!currentUser?.isAdmin) {
      navigate('/');
      return;
    }

    // Priority for URL parameters, then state, default to 'overview'
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    if (tabFromUrl && ['overview', 'users', 'courses', 'lessons', 'posts', 'reviews', 'events', 'addevent'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Update URL to match state for consistency
      navigate(`/admin-dashboard?tab=${location.state.activeTab}`, { replace: true });
    } else {
      // Default tab is now overview
      setActiveTab('overview');
      navigate('/admin-dashboard?tab=overview', { replace: true });
    }
  }, [currentUser, navigate, location]);

  // Helper function to change tabs and update URL
  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(`/admin-dashboard?tab=${tab}`, { state: { activeTab: tab }, replace: true });
  };

  // If we have no current user, show a login prompt
  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl mb-4">Admin Dashboard</h2>
        <p>Please log in to access the admin dashboard.</p>
        <button 
          onClick={() => navigate('/signin')} 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Only show search bar when not on overview tab and not on events or add event tab
  const showSearchBar = activeTab !== 'overview' && activeTab !== 'events' && activeTab !== 'addevent';

  return (
    <div className="flex">
      <div className="w-64">
        <DashSidebar />
      </div>
      <div className="flex-1 p-4 dark:bg-gray-800 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>
        
        {/* Search Bar */}
        {showSearchBar && (
          <div className="mb-6">
            <TextInput
              icon={HiSearch}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b mb-4 dark:text-white overflow-x-auto">
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('overview')}
          >
            <HiAcademicCap className="inline mr-2" /> Overview
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('users')}
          >
            <HiUsers className="inline mr-2" /> Users
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'courses' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('courses')}
          >
            <HiAcademicCap className="inline mr-2" /> Courses
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'lessons' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('lessons')}
          >
            <HiAcademicCap className="inline mr-2" /> Lessons
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('posts')}
          >
            <HiDocumentText className="inline mr-2" /> Posts
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('reviews')}
          >
            <HiStar className="inline mr-2" /> Reviews
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'events' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('events')}
          >
            <HiCalendar className="inline mr-2" /> Events
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'addevent' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('addevent')}
          >
            <HiCalendar className="inline mr-2" /> Add/Edit Event
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-lg shadow dark:text-white">
          {activeTab === 'overview' && <AdminLanding />}
          {activeTab === 'users' && <ShowUsers searchTerm={searchTerm} />}
          {activeTab === 'courses' && <ShowLearn searchTerm={searchTerm} />}
          {activeTab === 'lessons' && <ShowLesson searchTerm={searchTerm} />}
          {activeTab === 'posts' && <ShowPosts searchTerm={searchTerm} />}
          {activeTab === 'reviews' && <AdminReview searchTerm={searchTerm} />}
          {activeTab === 'events' && <EventCalendar isAdminView={true} />}
          {activeTab === 'addevent' && <AddEventForm />}
        </div>
      </div>
    </div>
  );
}