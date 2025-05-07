import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/userSlice';
import { 
  Button, 
  TextInput, 
  Alert, 
  Card, 
  Avatar, 
  Badge, 
  Modal, 
  Tabs, 
  Spinner,
  ModalFooter, 
  ModalHeader, 
  ModalBody 
} from 'flowbite-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiUser, HiKey, HiOutlineChartPie, HiOutlineCog } from 'react-icons/hi';
import DashSidebar from '../components/DashSidebar';

export default function AdminProfile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [siteStats, setSiteStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCourses: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if tab is specified in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (!currentUser.isAdmin) {
      navigate('/profile');
      return;
    }

    // Fetch site statistics when on dashboard tab
    if (activeTab === 'dashboard') {
      fetchSiteStatistics();
    }
  }, [currentUser, navigate, activeTab]);

  const fetchSiteStatistics = async () => {
    setIsLoading(true);
    try {
      // These endpoints should be implemented on your backend
      const [usersRes, postsRes, coursesRes] = await Promise.all([
        fetch('http://localhost:8080/api/user/count', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }),
        fetch('http://localhost:8080/api/posts/count', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }),
        fetch('http://localhost:8080/api/learns/count', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        })
      ]);

      const [usersData, postsData, coursesData] = await Promise.all([
        usersRes.json(),
        postsRes.json(),
        coursesRes.json()
      ]);

      setSiteStats({
        totalUsers: usersData.count || 0,
        totalPosts: postsData.count || 0,
        totalCourses: coursesData.count || 0
      });
    } catch (err) {
      console.error('Error fetching site statistics:', err);
      // Fallback data
      setSiteStats({
        totalUsers: 15,
        totalPosts: 24, 
        totalCourses: 8
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateStart());
      const res = await fetch(`http://localhost:8080/api/user/update/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(updateFailure(data.message));
      } else {
        dispatch(updateSuccess({ ...data, token: currentUser.token }));
      }
    } catch (err) {
      dispatch(updateFailure(err.message));
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`http://localhost:8080/api/user/delete/${currentUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await res.json();
      if (data.success) {
        dispatch(deleteUserSuccess());
        navigate('/signin');
      } else {
        dispatch(deleteUserFailure(data.message || 'Failed to delete account'));
      }
    } catch (err) {
      dispatch(deleteUserFailure(err.message || 'Network error: Could not delete account'));
    }
  };

  const handleSignout = () => {
    try {
      dispatch(signoutSuccess());
      navigate('/signin');
    } catch (err) {
      console.error('Signout error:', err);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64">
        <DashSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Admin Profile Header */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar
              img={currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_640.png'}
              rounded
              size="xl"
            />
            <div className="flex flex-col md:flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{currentUser.username}</h1>
                  <p className="text-gray-500">{currentUser.email}</p>
                </div>
                <Badge color="success" className="self-start md:self-auto">
                  Administrator
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You have administrator privileges and can access all platform features.
              </p>
            </div>
          </div>

          <Button onClick={handleSignout} outline className="mt-4">
            Sign Out
          </Button>
        </Card>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <Tabs>
            <Tabs.Item 
              active={activeTab === 'profile'} 
              title="Profile" 
              icon={HiUser}
              onClick={() => {
                setActiveTab('profile');
                navigate('/admin-profile?tab=profile');
              }}
            >
              <Card>
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                  <TextInput
                    id="username"
                    defaultValue={currentUser.username}
                    onChange={handleChange}
                    placeholder="Username"
                    label="Username"
                    required
                  />
                  <TextInput
                    id="email"
                    defaultValue={currentUser.email}
                    onChange={handleChange}
                    placeholder="Email"
                    label="Email"
                    required
                  />
                  <Button type="submit" gradientDuoTone="cyanToBlue" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </Card>
            </Tabs.Item>
            
            <Tabs.Item 
              active={activeTab === 'security'} 
              title="Security" 
              icon={HiKey}
              onClick={() => {
                setActiveTab('security');
                navigate('/admin-profile?tab=security');
              }}
            >
              <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Security Settings</h2>
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="Current Password"
                    onChange={handleChange}
                    label="Current Password"
                  />
                  <TextInput
                    id="newPassword"
                    type="password"
                    placeholder="New Password"
                    onChange={handleChange}
                    label="New Password"
                  />
                  <TextInput
                    id="confirmPassword"
                    type="password" 
                    placeholder="Confirm New Password"
                    onChange={handleChange}
                    label="Confirm New Password"
                  />
                  <Button type="submit" gradientDuoTone="purpleToBlue" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
                
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    color="failure"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </div>
              </Card>
            </Tabs.Item>
            
            <Tabs.Item 
              active={activeTab === 'dashboard'} 
              title="Dashboard" 
              icon={HiOutlineChartPie}
              onClick={() => {
                setActiveTab('dashboard');
                navigate('/admin-profile?tab=dashboard');
              }}
            >
              <Card>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Site Overview</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <Spinner size="xl" />
                    <p className="mt-2 text-gray-600">Loading statistics...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Stats Card */}
                    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                          <HiUser className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800">{siteStats.totalUsers}</h3>
                        <p className="text-gray-600">Registered Users</p>
                      </div>
                    </div>
                    
                    {/* Posts Stats Card */}
                    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                          <HiOutlineChartPie className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800">{siteStats.totalPosts}</h3>
                        <p className="text-gray-600">Posts Created</p>
                      </div>
                    </div>
                    
                    {/* Courses Stats Card */}
                    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                          <HiOutlineCog className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800">{siteStats.totalCourses}</h3>
                        <p className="text-gray-600">Courses Published</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button color="blue" onClick={() => navigate('/admin-dashboard')}>
                      Open Admin Dashboard
                    </Button>
                    <Button color="purple" onClick={() => navigate('/addlearn')}>
                      Create New Course
                    </Button>
                  </div>
                </div>
              </Card>
            </Tabs.Item>
          </Tabs>
        </div>
        
        {error && <Alert color="failure" className="mt-5">{error}</Alert>}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>Delete Account</ModalHeader>
        <ModalBody>
          <p className="text-gray-700">
            Are you sure you want to delete your admin account? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete}>
            Confirm
          </Button>
          <Button outline onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}