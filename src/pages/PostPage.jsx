import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button, Textarea, Badge } from 'flowbite-react';
import { HiCalendar } from 'react-icons/hi';
import postLogo from '../assets/postlogo.png';


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
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && error !== 'Comment cannot be empty' && error !== 'Edited comment cannot be empty') {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-400 bg-gray-900">
                {error === "Post not found" ? "The requested post does not exist." : error}
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Post Details */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    {post?.postImg && post.postImg !== 'default.png' ? (
                        <div className="relative">
                            <img
                                className="w-full h-72 object-cover rounded-t-xl"
                                src={`/api${post.postImg}`}
                                alt={post.postName}
                                onError={(e) => (e.target.src = postLogo)}
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
                        <div className="relative w-full h-72 bg-gray-600 flex items-center justify-center rounded-t-xl">
                            <img
                                src={postLogo}
                                alt="Placeholder"
                                className="w-24 h-24 object-contain"
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
                    <div className="p-4">
                        <h1 className="text-4xl font-extrabold text-white mb-3">{post.postName}</h1>
                        <Badge
                            color="gray"
                            className="mb-4 bg-gray-600 text-gray-200 px-3 py-1 rounded-full inline-block"
                        >
                            {post.postCategory || 'Uncategorized'}
                        </Badge>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {post.postDescription || 'No description available.'}
                        </p>
                    </div>
                </div>

                {/* Comment Section */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-3xl font-bold text-white mb-6">Comments</h2>

                    {/* Comment Form */}
                    <div className="mb-8">
                        <Textarea
                            className="w-full p-3 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            rows="4"
                            placeholder="Write your comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        {error === 'Comment cannot be empty' && (
                            <p className="text-red-400 text-sm mt-2">{error}</p>
                        )}
                        <Button
                            gradientDuoTone="purpleToBlue"
                            className="mt-3 rounded-full px-6 py-2"
                            onClick={handleCommentSubmit}
                        >
                            Post Comment
                        </Button>
                    </div>

                    {/* Comment List */}
                    {comments.length === 0 ? (
                        <p className="text-gray-400 text-lg">No comments yet. Be the first to comment!</p>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="border-b border-gray-700 pb-4 last:border-b-0"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-white text-lg">{comment.username}</p>
                                            <p className="text-gray-400 text-sm">
                                                {formatDate(comment.createdAt)}
                                            </p>
                                        </div>
                                        {comment.userId === currentUser.id && (
                                            <div className="flex space-x-3">
                                                <Button
                                                    size="sm"
                                                    gradientDuoTone="purpleToBlue"
                                                    className="rounded-full px-4 py-1"
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditedContent(comment.content);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    gradientDuoTone="redToYellow"
                                                    className="rounded-full px-4 py-1"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment.id ? (
                                        <div>
                                            <Textarea
                                                className="w-full p-3 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                                rows="3"
                                                value={editedContent}
                                                onChange={(e) => setEditedContent(e.target.value)}
                                            />
                                            {error === 'Edited comment cannot be empty' && (
                                                <p className="text-red-400 text-sm mt-2">{error}</p>
                                            )}
                                            <div className="flex space-x-3 mt-3">
                                                <Button
                                                    gradientDuoTone="purpleToBlue"
                                                    className="rounded-full px-6 py-2"
                                                    onClick={() => handleEditComment(comment.id)}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    color="gray"
                                                    className="rounded-full px-6 py-2 bg-gray-600 hover:bg-gray-500"
                                                    onClick={() => {
                                                        setEditingCommentId(null);
                                                        setEditedContent('');
                                                        setError(null);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-300 text-base">{comment.content}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}