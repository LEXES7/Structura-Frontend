import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function PostPage() {
    const { postId } = useParams(); // Get the post ID from the URL
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useSelector((state) => state.user); // Get the current user from Redux
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            // Redirect to login if the user is not authenticated
            navigate('/signin');
            return;
        }

        const fetchPost = async () => {
            try {
                // Fetch the post details with the Authorization header
                const response = await axios.get(`/api/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`, // Pass the token in the Authorization header
                    },
                });
                setPost(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err.response?.data?.message || 'Failed to load post.');
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, currentUser, navigate]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                {error === "Post not found" ? "The requested post does not exist." : error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Post Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                {post.postImg && (
                    <img
                        className="w-full h-64 object-cover rounded mb-4"
                        src={`/api${post.postImg}`}
                        alt={post.postName}
                        onError={(e) => (e.target.src = 'https://placehold.co/600x400')}
                    />
                )}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.postName}</h1>
                <p className="text-gray-600 text-sm mb-2">Category: {post.postCategory || 'Uncategorized'}</p>
                <p className="text-gray-700 text-base">{post.postDescription || 'No description available.'}</p>
            </div>
        </div>
    );
}