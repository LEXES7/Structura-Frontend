import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextInput, Spinner } from 'flowbite-react';
import { HiUsers, HiAcademicCap, HiDocumentText, HiSearch } from 'react-icons/hi';
import DashSidebar from '../components/DashSidebar';
import ShowUsers from '../components/admin/showusers';
import ShowPosts from '../components/admin/showposts';
import ShowLearn from '../components/admin/showlearn';
import ShowLesson from '../components/admin/showlesson';

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

    // Handle tab selection from navigation state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    } else if (location.search) {
      // Also support URL parameters for direct links
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && ['users', 'courses', 'posts'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [currentUser, navigate, location]);

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
      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
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
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => {
              setActiveTab('users');
              // Update URL state for bookmarking
              navigate('/admin-dashboard', { state: { activeTab: 'users' }, replace: true });
            }}
          >
            <HiUsers className="inline mr-2" /> Users
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'courses' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => {
              setActiveTab('courses');
              navigate('/admin-dashboard', { state: { activeTab: 'courses' }, replace: true });
            }}
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
            onClick={() => {
              setActiveTab('posts');
              navigate('/admin-dashboard', { state: { activeTab: 'posts' }, replace: true });
            }}
          >
            <HiDocumentText className="inline mr-2" /> Posts
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'users' && <ShowUsers searchTerm={searchTerm} />}
          {activeTab === 'courses' && <ShowLearn searchTerm={searchTerm} />}
          {activeTab === 'lessons' && <ShowLesson searchTerm={searchTerm} />}
          {activeTab === 'posts' && <ShowPosts searchTerm={searchTerm} />}
        </div>
      </div>
    </div>
  );
}