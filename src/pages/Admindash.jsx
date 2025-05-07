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
    // Check if user is admin
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/signin');
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch data based on active tab
        if (activeTab === 'users') {
          const response = await axios.get('/api/user/all', {
            headers: { Authorization: `Bearer ${currentUser.token}` }
          });
          setUsers(response.data);
        } else if (activeTab === 'courses') {
          const response = await axios.get('/api/learns', {
            headers: { Authorization: `Bearer ${currentUser.token}` }
          });
          setLearns(response.data);
        } else if (activeTab === 'posts') {
          const response = await axios.get('/api/post/all', {
            headers: { Authorization: `Bearer ${currentUser.token}` }
          });
          setPosts(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, activeTab, navigate]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/user/delete/${userId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user.');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/post/delete/${postId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        setError('Failed to delete post.');
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/learns/delete/${courseId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setLearns(learns.filter(learn => learn.id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
        setError('Failed to delete course.');
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
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Role</Table.HeadCell>
                <Table.HeadCell>Joined</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <Table.Row key={user.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Avatar img={user.profilePicture} rounded size="sm" />
                        {user.username}
                      </Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>
                        {user.isAdmin ? (
                          <Badge color="purple">Admin</Badge>
                        ) : (
                          <Badge color="gray">User</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button size="xs" color="info" onClick={() => navigate(`/user/${user.id}`)}>
                            <HiPencil className="mr-1" />View
                          </Button>
                          <Button size="xs" color="failure" onClick={() => handleDeleteUser(user.id)}>
                            <HiTrash className="mr-1" />Delete
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center py-4">No users found</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        );

      case 'courses':
        return (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Course Name</Table.HeadCell>
                <Table.HeadCell>Category</Table.HeadCell>
                <Table.HeadCell>Created At</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredLearns.length > 0 ? (
                  filteredLearns.map((learn) => (
                    <Table.Row key={learn.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {learn.learnName}
                      </Table.Cell>
                      <Table.Cell>{learn.learnCategory || 'Uncategorized'}</Table.Cell>
                      <Table.Cell>{new Date(learn.createdAt).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button size="xs" color="info" onClick={() => navigate(`/editcourse/${learn.id}`)}>
                            <HiPencil className="mr-1" />Edit
                          </Button>
                          <Button size="xs" color="failure" onClick={() => handleDeleteCourse(learn.id)}>
                            <HiTrash className="mr-1" />Delete
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={4} className="text-center py-4">No courses found</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        );

      case 'posts':
        return (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Category</Table.HeadCell>
                <Table.HeadCell>Author</Table.HeadCell>
                <Table.HeadCell>Created At</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <Table.Row key={post.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {post.title?.substring(0, 30)}...
                      </Table.Cell>
                      <Table.Cell>{post.category || 'Uncategorized'}</Table.Cell>
                      <Table.Cell>{post.username || 'Unknown'}</Table.Cell>
                      <Table.Cell>{new Date(post.createdAt).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button size="xs" color="info" onClick={() => navigate(`/post/${post.id}`)}>
                            <HiPencil className="mr-1" />View
                          </Button>
                          <Button size="xs" color="failure" onClick={() => handleDeletePost(post.id)}>
                            <HiTrash className="mr-1" />Delete
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center py-4">No posts found</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64">
        <DashSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your site content and users</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <TextInput
            icon={HiSearch}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px">
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                    activeTab === 'users'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <HiUsers className="mr-2 h-5 w-5" />
                  Users
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                    activeTab === 'courses'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <HiAcademicCap className="mr-2 h-5 w-5" />
                  Courses
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                    activeTab === 'posts'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <HiDocumentText className="mr-2 h-5 w-5" />
                  Posts
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-4 rounded-lg shadow">
          {renderContent()}
        </div>

        {/* Admin Actions */}
        <div className="mt-6 flex gap-4">
          {activeTab === 'courses' && (
            <Button color="success" onClick={() => navigate('/addlearn')}>
              Add New Course
            </Button>
          )}
          {activeTab === 'posts' && (
            <Button color="success" onClick={() => navigate('/addpost')}>
              Add New Post
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}