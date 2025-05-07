import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiPencil, HiTrash } from 'react-icons/hi';

export default function ShowPosts({ searchTerm = '' }) {
  const { currentUser } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/posts', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
        // Sample fallback data
        setPosts([
          {
            id: 1,
            title: 'Sample Post',
            content: 'This is a sample post content',
            category: 'Architecture',
            username: currentUser.username,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    };

    fetchPosts();
  }, [currentUser]);

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

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Spinner size="xl" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Post Management</h2>
        <Button 
          color="success" 
          onClick={() => navigate('/addpost')}
        >
          Add New Post
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Author</th>
              <th scope="col" className="px-6 py-3">Created</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr key={post.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {post.title?.substring(0, 30)}
                    {post.title?.length > 30 ? '...' : ''}
                  </td>
                  <td className="px-6 py-4">{post.category || 'Uncategorized'}</td>
                  <td className="px-6 py-4">{post.username || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    {new Date(post.createdAt).toLocaleDateString()}
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
                <td colSpan={5} className="text-center py-4">No posts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}