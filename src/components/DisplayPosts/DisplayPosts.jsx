import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Label, TextInput, Textarea, Badge, Spinner } from 'flowbite-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiCalendar, HiExclamation, HiTrash, HiPencil } from 'react-icons/hi';
import postLogo from '../../assets/postlogo.png';
import { fetchUserPostsSuccess } from '../../redux/userSlice';

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
    const { currentUser, userPosts } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchPosts = async () => {
            if (isDashboard && !currentUser) {
                setError("You must be logged in to view your posts");
                setLoading(false);
                return;
            }

            try {
                const url = isDashboard ? `${BASE_URL}/api/posts/user` : `${BASE_URL}/api/posts`;
                const config = isDashboard && token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                console.log(`Fetching posts from ${url} with token: ${token ? 'present' : 'absent'}`);
                const response = await axios.get(url, config);
                
                if (response.data && Array.isArray(response.data)) {
                    console.log(`Fetched ${response.data.length} posts`);
                    setPosts(response.data);
                    
                    // If in dashboard mode, update Redux store with user posts
                    if (isDashboard) {
                        dispatch(fetchUserPostsSuccess(response.data));
                    }
                } else {
                    console.error("Invalid response format:", response.data);
                    setError("Received invalid data format from server");
                    setPosts([]);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError(err.response?.data?.message || 'Failed to load posts. Please check your connection or login status.');
                setLoading(false);
            }
        };
        
        // Use userPosts from Redux if available in dashboard mode
        if (isDashboard && userPosts && userPosts.length > 0) {
            setPosts(userPosts);
            setLoading(false);
        } else {
            fetchPosts();
        }
    }, [isDashboard, token, currentUser, dispatch, userPosts]);

    const handleEditClick = (post) => {
        const postId = post._id || post.id;
        console.log("Editing post:", postId, post);
        setEditingPostId(postId);
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
        if (newImage) formData.append('file', newImage);

        try {
            console.log("Updating post:", editingPostId);
            const response = await axios.put(`${BASE_URL}/api/posts/${editingPostId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Post updated:", response.data);
            
            // Update local state
            const updatedPosts = posts.map(post => ((post._id || post.id) === editingPostId ? response.data : post));
            setPosts(updatedPosts);
            
            // Update Redux store if in dashboard mode
            if (isDashboard) {
                dispatch(fetchUserPostsSuccess(updatedPosts));
            }
            
            setEditingPostId(null);
            setNewImage(null);
        } catch (err) {
            console.error('Error updating post:', err);
            setError(err.response?.data?.message || 'Failed to update post.');
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
                console.log("Deleting post:", postId);
                await axios.delete(`${BASE_URL}/api/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Update local state
                const remainingPosts = posts.filter(post => (post._id !== postId && post.id !== postId));
                setPosts(remainingPosts);
                
                // Update Redux store if in dashboard mode
                if (isDashboard) {
                    dispatch(fetchUserPostsSuccess(remainingPosts));
                }
                
            } catch (err) {
                console.error('Error deleting post:', err);
                setError(err.response?.data?.message || 'Failed to delete post.');
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

    const getImageUrl = (imgPath) => {
        if (!imgPath || imgPath === 'default.png') {
            return postLogo;
        }
        if (imgPath.startsWith('http')) {
            return imgPath;
        }
        const url = `${BASE_URL}${imgPath}`;
        return url;
    };

    const filteredPosts = selectedCategory === 'All'
        ? posts
        : posts.filter(post => post.postCategory === selectedCategory);

    const categories = ['All', ...new Set(posts.map(post => post.postCategory || 'Uncategorized'))];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-400 bg-gray-900">
                <div className="flex items-center justify-center mb-4">
                    <HiExclamation className="mr-2 h-6 w-6" />
                    <p>{error}</p>
                </div>
                <Button onClick={() => setError(null)}>Dismiss</Button>
            </div>
        );
    }

    const containerClassName = isDashboard 
        ? "bg-white dark:bg-gray-900 rounded-lg shadow p-6" 
        : "bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen py-12";
    
    const titleColor = isDashboard 
        ? "text-gray-900 dark:text-white" 
        : "text-white";

    return (
        <div className={containerClassName}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-10">
                    <h1 className={`text-3xl font-bold ${titleColor} mb-6`}>
                        {isDashboard ? 'Your Posts' : 'All Posts'}
                    </h1>
                    {isDashboard && (
                        <Button
                            color="blue"
                            className="rounded-full px-6 py-2 shadow-lg text-white"
                            onClick={handleAddPost}
                        >
                            Add Post
                        </Button>
                    )}
                </div>

                {/* Display message if no posts are available */}
                {!loading && filteredPosts.length === 0 && (
                    <div className={`text-center ${
                        isDashboard 
                            ? 'bg-gray-50 dark:bg-gray-800 dark:text-white' 
                            : 'bg-gray-800 text-white'
                    } p-8 rounded-xl shadow-lg mt-8`}>
                        <h3 className={`text-2xl font-semibold mb-4 ${
                            isDashboard 
                                ? 'text-gray-800 dark:text-white' 
                                : 'text-white'
                        }`}>
                            No posts available
                        </h3>
                        {isDashboard ? (
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                You haven't created any posts yet. Get started by adding your first post!
                            </p>
                        ) : (
                            <p className="text-gray-400 mb-6">There are no posts available at this time.</p>
                        )}
                        {isDashboard && (
                            <Button
                                color="blue"
                                onClick={handleAddPost}
                                className="rounded-full px-6 py-2 text-white"
                            >
                                Create Your First Post
                            </Button>
                        )}
                    </div>
                )}

                {filteredPosts.length > 0 && (
                    <>
                        <div className="flex flex-wrap gap-3 mb-10">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    onClick={() => handleCategoryFilter(category)}
                                    color={selectedCategory === category ? 'light' : 'dark'}
                                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                                        selectedCategory === category
                                            ? isDashboard 
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white' 
                                                : 'bg-white text-gray-900 shadow-md'
                                            : isDashboard
                                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                    }`}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>

                        {isDashboard && editingPostId && (
                            <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Post</h2>
                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="postName" value="Post Title" className="text-gray-700 dark:text-gray-300 mb-2" />
                                        <TextInput
                                            id="postName"
                                            name="postName"
                                            value={editFormData.postName}
                                            onChange={handleEditChange}
                                            required
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postCategory" value="Category" className="text-gray-700 dark:text-gray-300 mb-2" />
                                        <TextInput
                                            id="postCategory"
                                            name="postCategory"
                                            value={editFormData.postCategory}
                                            onChange={handleEditChange}
                                            required
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postDescription" value="Description" className="text-gray-700 dark:text-gray-300 mb-2" />
                                        <Textarea
                                            id="postDescription"
                                            name="postDescription"
                                            value={editFormData.postDescription}
                                            onChange={handleEditChange}
                                            rows={4}
                                            required
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label value="Current Image" className="text-gray-700 dark:text-gray-300 mb-2" />
                                        <img
                                            src={getImageUrl(editFormData.postImg)}
                                            alt="Current"
                                            className="w-full h-40 object-cover rounded-lg shadow-md"
                                            onError={(e) => (e.target.src = postLogo)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postImg" value="Upload New Image" className="text-gray-700 dark:text-gray-300 mb-2" />
                                        <input
                                            type="file"
                                            id="postImg"
                                            name="postImg"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
                                        />
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            color="blue"
                                            onClick={handleSaveEdit}
                                            className="rounded-full px-6 py-2 text-white"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            color="gray"
                                            onClick={handleCancelEdit}
                                            className="rounded-full px-6 py-2"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map((post) => (
                                <div
                                    key={post._id || post.id}
                                    className={`${
                                        isDashboard 
                                            ? 'bg-white dark:bg-gray-800' 
                                            : 'bg-gray-800'
                                    } rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${
                                        isDashboard 
                                            ? 'border-gray-200 dark:border-gray-700' 
                                            : 'border-gray-700'
                                    }`}
                                    onClick={() => handlePostClick(post._id || post.id)}
                                >
                                    {post.postImg && post.postImg !== 'default.png' ? (
                                        <div className="relative">
                                            <img
                                                className="w-full h-56 object-cover rounded-t-xl"
                                                src={getImageUrl(post.postImg)}
                                                alt={post.postName}
                                                onError={(e) => {
                                                    console.error("Image failed to load:", post.postImg);
                                                    e.target.src = postLogo;
                                                }}
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
                                        <div className={`relative w-full h-56 ${
                                            isDashboard 
                                                ? 'bg-gray-100 dark:bg-gray-700' 
                                                : 'bg-gray-600'
                                        } flex items-center justify-center rounded-t-xl`}>
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
                                        <h2 className={`text-xl font-semibold ${
                                            isDashboard 
                                                ? 'text-gray-800 dark:text-white' 
                                                : 'text-white'
                                        } mb-3 line-clamp-2 leading-tight`}>
                                            {post.postName}
                                        </h2>
                                        <Badge
                                            color={isDashboard ? "blue" : "gray"}
                                            className={`mb-3 ${
                                                isDashboard 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                                    : 'bg-gray-600 text-gray-200'
                                            } px-3 py-1 rounded-full`}
                                        >
                                            {post.postCategory || 'Uncategorized'}
                                        </Badge>
                                        {isDashboard && (
                                            <div className="flex space-x-3 mt-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(post);
                                                    }}
                                                    className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                >
                                                    <HiPencil className="-ml-1 mr-1 h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(post._id || post.id);
                                                    }}
                                                    className="inline-flex items-center rounded-full bg-red-600 px-4 py-1 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                >
                                                    <HiTrash className="-ml-1 mr-1 h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}