import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Avatar, Badge, Spinner, TextInput } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiUsers, HiAcademicCap, HiDocumentText, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import DashSidebar from '../components/DashSidebar';

export default function Admindash() {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [learns, setLearns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!currentUser?.isAdmin) {
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      
      try {
        if (activeTab === 'users') {
          // For now, just set the current user as the only user
          // Once your backend API is ready, you can uncomment the axios request
          /*
          try {
            const response = await axios.get('/api/user/all', {
              headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            setUsers(response.data);
          } catch (err) {
            console.error('Error fetching users:', err);
            setUsers([currentUser]); // Fallback to just the current user
          }
          */
          
          // Temporary solution until backend endpoint is ready
          setUsers([currentUser]);
        } 
        else if (activeTab === 'courses') {
          const response = await axios.get('/api/learns', {
            headers: { Authorization: `Bearer ${currentUser.token}` }
          });
          setLearns(response.data);
        } 
        else if (activeTab === 'posts') {
          const response = await axios.get('/api/posts', {
            headers: { Authorization: `Bearer ${currentUser.token}` }
          });
          setPosts(response.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in admin dashboard:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, activeTab, navigate]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/user/delete/${userId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/learns/${courseId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setLearns(learns.filter(learn => learn.id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
        setError('Failed to delete course. Please try again.');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        setError('Failed to delete post. Please try again.');
      }
    }
  };

  // Filter data based on search term
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLearns = learns.filter(learn => 
    learn.learnName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    learn.learnCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(post => 
    post.postName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.postCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="xl" /></div>;
    }

    if (error) {
      return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    switch (activeTab) {
      case 'users':
        return (
          <div className="overflow-x-auto">
            <div className="relative w-full">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">User</th>
                      <th scope="col" className="px-6 py-3">Email</th>
                      <th scope="col" className="px-6 py-3">Role</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <Avatar img={user.profilePicture || "https://placehold.co/150"} rounded size="sm" />
                              {user.username}
                            </div>
                          </td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">
                            <Badge color={user.isAdmin ? "success" : "info"}>
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button size="xs" color="info" onClick={() => navigate(`/profile`)}>
                                <HiPencil className="mr-1" />View
                              </Button>
                              {user.id !== currentUser.id && (
                                <Button size="xs" color="failure" onClick={() => handleDeleteUser(user.id)}>
                                  <HiTrash className="mr-1" />Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="overflow-x-auto">
            <div className="relative w-full">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Course Name</th>
                      <th scope="col" className="px-6 py-3">Category</th>
                      <th scope="col" className="px-6 py-3">Description</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLearns.length > 0 ? (
                      filteredLearns.map((learn) => (
                        <tr key={learn.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {learn.learnName}
                          </td>
                          <td className="px-6 py-4">{learn.learnCategory || 'Uncategorized'}</td>
                          <td className="px-6 py-4">
                            {learn.learnDescription?.substring(0, 50)}
                            {learn.learnDescription?.length > 50 ? '...' : ''}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button size="xs" color="info" onClick={() => navigate(`/editlearn/${learn.id}`)}>
                                <HiPencil className="mr-1" />Edit
                              </Button>
                              <Button size="xs" color="failure" onClick={() => handleDeleteCourse(learn.id)}>
                                <HiTrash className="mr-1" />Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">No courses found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'posts':
        return (
          <div className="overflow-x-auto">
            <div className="relative w-full">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Post Name</th>
                      <th scope="col" className="px-6 py-3">Category</th>
                      <th scope="col" className="px-6 py-3">Description</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <tr key={post.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {post.postName || post.title}
                          </td>
                          <td className="px-6 py-4">{post.postCategory || post.category || 'Uncategorized'}</td>
                          <td className="px-6 py-4">
                            {(post.postDescription || post.content)?.substring(0, 50)}
                            {(post.postDescription || post.content)?.length > 50 ? '...' : ''}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button size="xs" color="info" onClick={() => navigate(`/post/${post.id}`)}>
                                <HiPencil className="mr-1" />View
                              </Button>
                              <Button size="xs" color="failure" onClick={() => handleDeletePost(post.id)}>
                                <HiTrash className="mr-1" />Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">No posts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view data</div>;
    }
  };

  // If we have no current user, show a login prompt
  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl mb-4">Admin Dashboard</h2>
        <p>Please log in to access the admin dashboard.</p>
        <Button onClick={() => navigate('/signin')} className="mt-4">
          Sign In
        </Button>
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
            onClick={() => setActiveTab('users')}
          >
            <HiUsers className="inline mr-2" /> Users
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'courses' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <HiAcademicCap className="inline mr-2" /> Courses
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <HiDocumentText className="inline mr-2" /> Posts
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}