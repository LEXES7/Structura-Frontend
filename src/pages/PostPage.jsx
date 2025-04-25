import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function PostPage() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
            return;
        }

        const fetchPostAndComments = async () => {
            try {
                const postResponse = await axios.get(`/api/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
                setPost(postResponse.data);

                const commentsResponse = await axios.get(`/api/comments/post/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
                setComments(commentsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Failed to load data.');
                setLoading(false);
            }
        };

        fetchPostAndComments();
    }, [postId, currentUser, navigate]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            const response = await axios.post(
                `/api/comments/post/${postId}`,
                { content: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                }
            );
            setComments([...comments, response.data]);
            setNewComment('');
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post comment.');
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editedContent.trim()) {
            setError('Edited comment cannot be empty');
            return;
        }

        try {
            const response = await axios.put(
                `/api/comments/${commentId}`,
                { content: editedContent },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                }
            );
            setComments(
                comments.map((comment) =>
                    comment.id === commentId ? response.data : comment
                )
            );
            setEditingCommentId(null);
            setEditedContent('');
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update comment.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await axios.delete(`/api/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });
            setComments(comments.filter((comment) => comment.id !== commentId));
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete comment.');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error && error !== 'Comment cannot be empty' && error !== 'Edited comment cannot be empty') {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                {error === "Post not found" ? "The requested post does not exist." : error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Pt Details */}
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

            {/* Comment Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h2>


                <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Write your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    {error === 'Comment cannot be empty' && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Post Comment
                    </button>
                </form>

                {/* C List */}
                {comments.length === 0 ? (
                    <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="border-b pb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-gray-800">{comment.username}</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-gray-500 text-sm">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                        {comment.userId === currentUser.id && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditedContent(comment.content);
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {editingCommentId === comment.id ? (
                                    <div>
                                        <textarea
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                        ></textarea>
                                        {error === 'Edited comment cannot be empty' && (
                                            <p className="text-red-500 text-sm mt-1">{error}</p>
                                        )}
                                        <div className="flex space-x-2 mt-2">
                                            <button
                                                onClick={() => handleEditComment(comment.id)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingCommentId(null);
                                                    setEditedContent('');
                                                    setError(null);
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700">{comment.content}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}