import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextInput, Spinner } from 'flowbite-react';
import { HiUsers, HiAcademicCap, HiDocumentText, HiSearch, HiStar } from 'react-icons/hi';
import DashSidebar from '../components/DashSidebar';
import ShowUsers from '../components/admin/showusers';
import ShowPosts from '../components/admin/showposts';



import ShowLearn from '../components/admin/showlearn';
import ShowLesson from '../components/admin/showlesson';










import DisplayCourses from '../components/DisplayCourses/DisplayCourses';
import AdminReview from '../components/admin/adminreview';








export default function Admindash() {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is admin
    if (!currentUser?.isAdmin) {
      navigate('/');
      return;
    }

    // Priority for URL parameters, then state, default to 'users'
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    if (tabFromUrl && ['users', 'courses', 'posts', 'reviews'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Update URL to match state for consistency
      navigate(`/admin-dashboard?tab=${location.state.activeTab}`, { replace: true });
    } else {
      // Default tab
      setActiveTab('users');
      navigate('/admin-dashboard?tab=users', { replace: true });
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

  return (
    <div className="flex">
      <div className="w-64">
        <DashSidebar />
      </div>
      <div className="flex-1 p-4 dark:bg-gray-800 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <TextInput
            icon={HiSearch}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4 dark:text-white">
          <button
            className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('users')}
          >
            <HiUsers className="inline mr-2" /> Users
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'courses' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('courses')}
          >
            <HiAcademicCap className="inline mr-2" /> Courses
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'lessons' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => {
              setActiveTab('courses');
              navigate('/admin-dashboard', { state: { activeTab: 'lessons' }, replace: true });
            }}
          >
            <HiAcademicCap className="inline mr-2" /> Lessons
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('posts')}
          >
            <HiDocumentText className="inline mr-2" /> Posts
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => switchTab('reviews')}
          >
            <HiStar className="inline mr-2" /> Reviews
          </button>
        </div>

        {/* Content Area */}
        <div className=" rounded-lg shadow dark:text-white">
          {activeTab === 'users' && <ShowUsers searchTerm={searchTerm} />}









          {activeTab === 'courses' && <ShowLearn searchTerm={searchTerm} />}
          {activeTab === 'lessons' && <ShowLesson searchTerm={searchTerm} />}
          {activeTab === 'courses' && <DisplayCourses isDashboard={true} />}
          {activeTab === 'posts' && <ShowPosts searchTerm={searchTerm} />}
          {activeTab === 'reviews' && <AdminReview searchTerm={searchTerm} />}
        </div>
      </div>
    </div>
  );
}