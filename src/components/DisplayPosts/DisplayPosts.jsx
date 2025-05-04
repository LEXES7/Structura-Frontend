import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Label, TextInput, Textarea, Badge } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiCalendar } from 'react-icons/hi';
import postLogo from '../../assets/postlogo.png'; 


const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    } catch (err) {
        return 'Date unavailable';
    }
};

export default function DisplayPosts({ isDashboard = false }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        postName: '',
        postCategory: '',
        postDescription: '',
        postImg: '',
    });
    const [newImage, setNewImage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = isDashboard ? '/api/posts/user' : '/api/posts';
                const config = isDashboard && token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(url, config);
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts.');
                setLoading(false);
            }
        };
        fetchPosts();
    }, [isDashboard, token]);

    const handleEditClick = (post) => {
        setEditingPostId(post.id);
        setEditFormData({
            postName: post.postName || '',
            postCategory: post.postCategory || '',
            postDescription: post.postDescription || '',
            postImg: post.postImg || 'default.png',
        });
        setNewImage(null);
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleSaveEdit = async () => {
        if (!token) {
            setError('You must be logged in to edit posts.');
            return;
        }
        const formData = new FormData();
        formData.append('postName', editFormData.postName);
        formData.append('postCategory', editFormData.postCategory);
        formData.append('postDescription', editFormData.postDescription);
        if (newImage) formData.append('postImg', newImage);

        try {
            const response = await axios.put(`/api/posts/${editingPostId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setPosts(posts.map(post => (post.id === editingPostId ? response.data : post)));
            setEditingPostId(null);
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post.');
        }
    };

    const handleCancelEdit = () => {
        setEditingPostId(null);
        setNewImage(null);
    };

    const handleDelete = async (postId) => {
        if (!token) {
            setError('You must be logged in to delete posts.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`/api/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPosts(posts.filter(post => post.id !== postId));
            } catch (err) {
                console.error('Error deleting post:', err);
                setError('Failed to delete post.');
            }
        }
    };

    const handleAddPost = () => {
        navigate('/addpost');
    };

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
    };

    const filteredPosts = selectedCategory === 'All'
        ? posts
        : posts.filter(post => post.postCategory === selectedCategory);

    const categories = ['All', ...new Set(posts.map(post => post.postCategory || 'Uncategorized'))];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-400 bg-gray-900">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                        {isDashboard ? 'Your Posts.' : 'All Posts.'}
                    </h1>
                    {isDashboard && (
                        <Button
                            gradientDuoTone="purpleToBlue"
                            className="rounded-full px-6 py-2 shadow-lg"
                            onClick={handleAddPost}
                        >
                            Add Post
                        </Button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            onClick={() => handleCategoryFilter(category)}
                            color={selectedCategory === category ? 'light' : 'dark'}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                                selectedCategory === category
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }`}
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Edit Form */}
                {isDashboard && editingPostId && (
                    <div className="mb-12 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                        <h2 className="text-3xl font-bold mb-6 text-white">Edit Post</h2>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="postName" value="Post Title" className="text-gray-300 mb-2" />
                                <TextInput
                                    id="postName"
                                    name="postName"
                                    value={editFormData.postName}
                                    onChange={handleEditChange}
                                    required
                                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <Label htmlFor="postCategory" value="Category" className="text-gray-300 mb-2" />
                                <TextInput
                                    id="postCategory"
                                    name="postCategory"
                                    value={editFormData.postCategory}
                                    onChange={handleEditChange}
                                    required
                                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <Label htmlFor="postDescription" value="Description" className="text-gray-300 mb-2" />
                                <Textarea
                                    id="postDescription"
                                    name="postDescription"
                                    value={editFormData.postDescription}
                                    onChange={handleEditChange}
                                    rows={4}
                                    required
                                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <Label value="Current Image" className="text-gray-300 mb-2" />
                                <img
                                    src={`/api${editFormData.postImg}`}
                                    alt="Current"
                                    className="w-full h-40 object-cover rounded-lg shadow-md"
                                    onError={(e) => (e.target.src = postLogo)} // Updated placeholder
                                />
                            </div>
                            <div>
                                <Label htmlFor="postImg" value="Upload New Image" className="text-gray-300 mb-2" />
                                <input
                                    type="file"
                                    id="postImg"
                                    name="postImg"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    gradientDuoTone="purpleToBlue"
                                    onClick={handleSaveEdit}
                                    className="rounded-full px-6 py-2"
                                >
                                    Save
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={handleCancelEdit}
                                    className="rounded-full px-6 py-2 bg-gray-600 hover:bg-gray-500"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            onClick={() => handlePostClick(post.id)}
                        >
                            {post.postImg && post.postImg !== 'default.png' ? (
                                <div className="relative">
                                    <img
                                        className="w-full h-56 object-cover rounded-t-xl"
                                        src={`/api${post.postImg}`}
                                        alt={post.postName}
                                        onError={(e) => (e.target.src = postLogo)} // Updated placeholder
                                    />
                                    <Badge
                                        color="info"
                                        icon={HiCalendar}
                                        className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full"
                                    >
                                        {formatDate(post.createdAt)}
                                    </Badge>
                                </div>
                            ) : (
                                <div className="relative w-full h-56 bg-gray-600 flex items-center justify-center rounded-t-xl">
                                    <img
                                        src={postLogo}
                                        alt="Placeholder"
                                        className="w-16 h-16 object-contain"
                                    />
                                    <Badge
                                        color="info"
                                        icon={HiCalendar}
                                        className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full"
                                    >
                                        {formatDate(post.createdAt)}
                                    </Badge>
                                </div>
                            )}
                            <div className="p-5">
                                <h2 className="text-xl font-semibold text-white mb-3 line-clamp-2 leading-tight">
                                    {post.postName}
                                </h2>
                                <Badge
                                    color="gray"
                                    className="mb-3 bg-gray-600 text-gray-200 px-3 py-1 rounded-full"
                                >
                                    {post.postCategory || 'Uncategorized'}
                                </Badge>
                                {isDashboard && (
                                    <div className="flex space-x-3 mt-4">
                                        <Button
                                            gradientDuoTone="purpleToBlue"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(post);
                                            }}
                                            className="rounded-full px-4 py-1"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            gradientDuoTone="redToYellow"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(post.id);
                                            }}
                                            className="rounded-full px-4 py-1"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}