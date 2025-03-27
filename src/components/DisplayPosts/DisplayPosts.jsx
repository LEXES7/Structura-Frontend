import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Label, TextInput, Textarea } from 'flowbite-react';

const DisplayPosts = () => {
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

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/posts');
                console.log('Fetched posts:', response.data);
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts.');
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Handle edit button click
    const handleEditClick = (post) => {
        setEditingPostId(post.id);
        setEditFormData({
            postName: post.postName || '',
            postCategory: post.postCategory || '',
            postDescription: post.postDescription || '',
            postImg: post.postImg || 'default.png',
        });
        setNewImage(null); // Reset the new image state
    };

    // Handle form input changes
    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewImage(file);
    };

    // Handle save edit
    const handleSaveEdit = async () => {
        const formData = new FormData();
        formData.append('postName', editFormData.postName);
        formData.append('postCategory', editFormData.postCategory);
        formData.append('postDescription', editFormData.postDescription);
        if (newImage) {
            formData.append('postImg', newImage); // Append the new image if selected
        }

        try {
            const response = await axios.put(`http://localhost:8080/api/posts/${editingPostId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Updated post:', response.data);
            setPosts(posts.map(post => (post.id === editingPostId ? response.data : post)));
            setEditingPostId(null); // Hide the form after saving
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post.');
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingPostId(null);
        setNewImage(null); // Reset the new image state
    };

    // Handle delete
    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`http://localhost:8080/api/posts/${postId}`);
                setPosts(posts.filter(post => post.id !== postId));
            } catch (err) {
                console.error('Error deleting post:', err);
                setError('Failed to delete post.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold mb-6">Posts</h1>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Blogs</h1>

            {/* Edit Form */}
            {editingPostId && (
                <div className="mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
                    <div className="mb-4">
                        <Label htmlFor="postName" value="Post Title" />
                        <TextInput
                            id="postName"
                            name="postName"
                            value={editFormData.postName}
                            onChange={handleEditChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="postCategory" value="Category" />
                        <TextInput
                            id="postCategory"
                            name="postCategory"
                            value={editFormData.postCategory}
                            onChange={handleEditChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="postDescription" value="Description" />
                        <Textarea
                            id="postDescription"
                            name="postDescription"
                            value={editFormData.postDescription}
                            onChange={handleEditChange}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label value="Current Image" />
                        <img
                            src={`http://localhost:8080${editFormData.postImg}`}
                            alt="Current"
                            className="w-full h-32 object-cover rounded"
                            onError={(e) => {
                                console.error(`Failed to load edit image: ${editFormData.postImg}`);
                                e.target.src = 'https://placehold.co/150x150';
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="postImg" value="Upload New Image" />
                        <input
                            type="file"
                            id="postImg"
                            name="postImg"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button color="blue" onClick={handleSaveEdit}>
                            Save
                        </Button>
                        <Button color="gray" onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Posts List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-4"
                    >
                        {post.postImg && post.postImg !== 'default.png' ? (
                            <img
                                className="w-full h-48 object-cover mb-4"
                                src={`http://localhost:8080${post.postImg}`}
                                alt={post.postName}
                                onError={(e) => {
                                    console.error(`Failed to load image: ${post.postImg}`);
                                    e.target.src = 'https://placehold.co/150x150';
                                }}
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4">
                                <span className="text-gray-500">No Image</span>
                            </div>
                        )}
                        <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">
                            {post.postName}
                        </h2>
                        <p className="text-gray-600 text-sm mb-2">
                            Category: {post.postCategory || 'Uncategorized'}
                        </p>
                        <p className="text-gray-700 text-base line-clamp-2 mb-4">
                            {post.postDescription || 'No description'}
                        </p>
                        <div className="flex space-x-2">
                            <Button color="blue" size="sm" onClick={() => handleEditClick(post)}>
                                Edit
                            </Button>
                            <Button color="red" size="sm" onClick={() => handleDelete(post.id)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DisplayPosts;