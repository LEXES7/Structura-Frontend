import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Spinner, Badge, Alert } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiEye, HiPencil, HiTrash, HiHeart, HiShare, HiOutlineCalendar, HiOutlineExclamation } from 'react-icons/hi';

export default function ShowPosts({ searchTerm = '' }) {
  const { currentUser } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [postToDelete, setPostToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/posts', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        
        const fetchedPosts = response.data;
        setPosts(fetchedPosts);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(fetchedPosts.map(post => post.postCategory || 'Uncategorized'))];
        setCategories(['All', ...uniqueCategories]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser]);

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setConfirmDelete(true);
  };

  const confirmDeletePost = async () => {
    try {
      await axios.delete(`/api/posts/${postToDelete.id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setSuccess(`Post "${postToDelete.postName}" deleted successfully`);
      setPostToDelete(null);
      setConfirmDelete(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
      setConfirmDelete(false);
    }
  };

  const cancelDelete = () => {
    setPostToDelete(null);
    setConfirmDelete(false);
  };

  // Apply filters
  const filteredPosts = posts.filter(post => {
    // Apply category filter
    const categoryMatch = categoryFilter === 'All' || post.postCategory === categoryFilter;
    
    // Apply search term
    const searchMatch = searchTerm === '' || 
      post.postName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.postDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600">Loading posts...</p>
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
        <h2 className="text-xl font-semibold">Post Management ({filteredPosts.length})</h2>
        <Button 
          color="success" 
          className="flex items-center"
          onClick={() => navigate('/addpost')}
        >
          <HiPencil className="mr-2" /> Add New Post
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <Badge 
            key={category} 
            color={categoryFilter === category ? "blue" : "gray"}
            className="cursor-pointer px-3 py-1.5 text-xs font-medium"
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Post Title</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Author</th>
              <th scope="col" className="px-6 py-3">Stats</th>
              <th scope="col" className="px-6 py-3">Created</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr key={post.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                    {post.postName}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color="indigo" className="px-2 py-1">
                      {post.postCategory || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{post.username || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <HiHeart className="mr-1 text-red-500" /> {post.likedBy?.length || 0}
                      </span>
                      <span className="flex items-center">
                        <HiShare className="mr-1 text-blue-500" /> {post.shareCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <HiOutlineCalendar className="mr-1" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button size="xs" color="info" className="flex items-center" onClick={() => navigate(`/post/${post.id}`)}>
                        <HiEye className="mr-1" /> View
                      </Button>
                      <Button size="xs" color="failure" className="flex items-center" onClick={() => handleDeleteClick(post)}>
                        <HiTrash className="mr-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  {searchTerm || categoryFilter !== 'All' 
                    ? "No posts match your filter criteria" 
                    : "No posts found in the database"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete Post
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the post <span className="font-bold">"{postToDelete.postName}"</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <Button color="gray" onClick={cancelDelete}>Cancel</Button>
              <Button color="failure" onClick={confirmDeletePost}>
                Yes, Delete Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}