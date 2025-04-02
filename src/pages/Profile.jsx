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
import { Button, TextInput, Alert, Card, Avatar, Badge, Modal, ModalFooter, ModalHeader, ModalBody } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    <div className='flex items-center justify-center'>
      <Card className="w-full max-w-3xl shadow-lg">
        <div className="flex flex-col items-center">
          <Avatar
            img={currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_640.png'}
            rounded
            size="xl"
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">{currentUser.username}</h1>
          <p className="text-gray-500">{currentUser.email}</p>
          <Badge color={currentUser.isAdmin ? 'success' : 'info'} className="mt-2">
            {currentUser.isAdmin ? 'Admin' : 'User'}
          </Badge>
        </div>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-6">
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
          <TextInput
            id="password"
            type="password"
            placeholder="New Password"
            onChange={handleChange}
            label="New Password"
          />
          <Button type="submit" gradientDuoTone="cyanToBlue" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </form>
        <div className="flex gap-4 mt-6">
          <Button
            onClick={() => setShowDeleteModal(true)}
            color="failure"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
          <Button onClick={handleSignout} outline className="w-full">
            Sign Out
          </Button>
        </div>
        {error && <Alert color="failure" className="mt-5">{error}</Alert>}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>Delete Account</ModalHeader>
        <ModalBody>
          <p className="text-gray-700">
            Are you sure you want to delete your account? This action cannot be undone.
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