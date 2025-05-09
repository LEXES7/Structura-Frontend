import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Avatar, Badge, Spinner, Alert } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { HiPencil, HiTrash, HiEye, HiOutlineExclamation } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function ShowUsers({ searchTerm = '' }) {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch all users including regular users and admins
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/user/all', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        
        // Sort users: admins first, then regular users
        const sortedUsers = response.data.sort((a, b) => {
          // Sort by admin status first
          if (a.isAdmin && !b.isAdmin) return -1;
          if (!a.isAdmin && b.isAdmin) return 1;
          
          // Then sort by username
          return a.username.localeCompare(b.username);
        });
        
        setUsers(sortedUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Failed to load users. Please try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setConfirmDelete(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`/api/user/delete/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setSuccess(`User ${userToDelete.username} deleted successfully`);
      setConfirmDelete(false);
      setUserToDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user. Please try again.');
      setConfirmDelete(false);
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
    setConfirmDelete(false);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle view user profile
  const handleViewUser = (userId) => {
    // Redirect to user profile page
    navigate(`/admin-dashboard/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <Alert color="failure" className="mb-4" icon={HiOutlineExclamation}>
          <span className="font-medium">Error!</span> {error}
        </Alert>
      )}
      
      {success && (
        <Alert color="success" className="mb-4">
          <span className="font-medium">Success!</span> {success}
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management ({filteredUsers.length})</h2>
      </div>
      
      {/* Container with fixed height for scrollable table */}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3">Registration Date</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                    user.isAdmin ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-3">
                        <Avatar 
                          img={user.profilePicture || "https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_640.png"}
                          rounded
                          size="sm"
                        />
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge color={user.isAdmin ? "success" : "info"} className="px-2 py-1">
                        {user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button size="xs" color="info" className="flex items-center" onClick={() => handleViewUser(user.id)}>
                          <HiEye className="mr-1" /> View
                        </Button>
                        <Button size="xs" color="warning" className="flex items-center" onClick={() => navigate(`/admin-dashboard/edit-user/${user.id}`)}>
                          <HiPencil className="mr-1" /> Edit
                        </Button>
                        {user.id !== currentUser.id && (
                          <Button size="xs" color="failure" className="flex items-center" onClick={() => handleDeleteUser(user)}>
                            <HiTrash className="mr-1" /> Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {searchTerm ? "No users match your search criteria" : "No users found in the database"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete User
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the user <span className="font-bold">{userToDelete.username}</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <Button color="gray" onClick={cancelDelete}>Cancel</Button>
              <Button color="failure" onClick={confirmDeleteUser}>
                Yes, Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}