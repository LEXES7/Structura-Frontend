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
import { Button, TextInput, Alert, Card, Badge, Modal, ModalFooter, ModalHeader, ModalBody, Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineUser, HiOutlineLockClosed, HiCheck } from 'react-icons/hi';
import DashSidebar from '../components/DashSidebar';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState(null); // 'success' or 'error'
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (Object.keys(formData).length === 0) {
      setUpdateStatus('error');
      setUpdateMessage('No changes to update');
      setTimeout(() => {
        setUpdateStatus(null);
        setUpdateMessage('');
      }, 3000);
      return;
    }
    
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
        setUpdateStatus('error');
        setUpdateMessage(data.message || 'Update failed');
      } else {
        dispatch(updateSuccess({ ...data.user, token: currentUser.token }));
        setUpdateStatus('success');
        setUpdateMessage('Profile updated successfully!');
        
        // Clear form data after successful update
        setFormData({});
      }
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateStatus(null);
        setUpdateMessage('');
      }, 3000);
    } catch (err) {
      dispatch(updateFailure(err.message));
      setUpdateStatus('error');
      setUpdateMessage(err.message || 'An error occurred');
      setTimeout(() => {
        setUpdateStatus(null);
        setUpdateMessage('');
      }, 3000);
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
        setUpdateStatus('error');
        setUpdateMessage(data.message || 'Failed to delete account');
        setTimeout(() => {
          setUpdateStatus(null);
          setUpdateMessage('');
        }, 3000);
      }
    } catch (err) {
      dispatch(deleteUserFailure(err.message || 'Network error: Could not delete account'));
      setUpdateStatus('error');
      setUpdateMessage(err.message || 'Network error: Could not delete account');
      setTimeout(() => {
        setUpdateStatus(null);
        setUpdateMessage('');
      }, 3000);
    }
  };

  const handleSignout = async () => {
    try {
      // Call backend signout endpoint
      const res = await fetch('http://localhost:8080/api/auth/signout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      
      // Regardless of response, sign out from frontend
      dispatch(signoutSuccess());
      navigate('/signin');
    } catch (err) {
      console.error('Signout error:', err);
      // Still sign out from frontend even if API call fails
      dispatch(signoutSuccess());
      navigate('/signin');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64">
        <DashSidebar />
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
        <div className="w-full max-w-3xl mx-auto">
          {/* Profile Card */}
          <Card className="mb-6 bg-white border border-gray-200">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-gray-100">
              {/* Fixed Avatar - using a div with background image for more control */}
              <div 
                className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-blue-100 flex-shrink-0 shadow-md"
                style={{
                  backgroundImage: `url(${currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_640.png'})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}
              />
              
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-2xl font-bold text-gray-900">{currentUser.username}</h1>
                <p className="text-gray-500 mb-2">{currentUser.email}</p>
                <Badge color={currentUser.isAdmin ? 'success' : 'info'} className="px-3 py-1">
                  {currentUser.isAdmin ? 'Administrator' : 'User'}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">
                  Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Status Message */}
            {updateMessage && (
              <Alert color={updateStatus === 'success' ? 'success' : 'failure'} className="mt-4">
                {updateStatus === 'success' ? (
                  <div className="flex items-center">
                    <HiCheck className="mr-2 h-5 w-5" /> {updateMessage}
                  </div>
                ) : (
                  updateMessage
                )}
              </Alert>
            )}
              
            {/* Profile Form */}
            <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <TextInput
                  id="username"
                  defaultValue={currentUser.username}
                  onChange={handleChange}
                  placeholder="Username"
                  icon={HiOutlineUser}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <TextInput
                  id="email"
                  defaultValue={currentUser.email}
                  onChange={handleChange}
                  placeholder="Email"
                  icon={HiOutlineMail}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <TextInput
                  id="password"
                  type="password"
                  placeholder="Enter new password to change"
                  onChange={handleChange}
                  icon={HiOutlineLockClosed}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep your current password</p>
              </div>

              {/* Profile Picture URL Field */}
              <div>
                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture URL
                </label>
                <TextInput
                  id="profilePicture"
                  defaultValue={currentUser.profilePicture || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a valid image URL for your profile picture</p>
              </div>
              
              <Button 
                type="submit" 
                color="blue"
                disabled={loading}
                className="mt-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : 'Update Profile'}
              </Button>
            </form>
            
            {/* Account Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  color="failure"
                  disabled={loading}
                  className="w-full"
                >
                  Delete Account
                </Button>
                <Button 
                  onClick={handleSignout} 
                  color="light"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
          
          {error && <Alert color="failure" className="mt-5">{error}</Alert>}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>Delete Account</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            
            <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm">
              <p className="font-medium">Warning:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All your personal information will be deleted</li>
                <li>Your posts and comments will be removed</li>
                <li>You will not be able to recover this account</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDelete}>
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : 'Yes, Delete My Account'}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}