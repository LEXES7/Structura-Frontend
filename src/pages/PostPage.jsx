import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button, Textarea, Badge } from 'flowbite-react';
import { HiCalendar, HiLockClosed, HiThumbUp, HiShare, HiUsers } from 'react-icons/hi';
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
    const BASE_URL = 'http://localhost:8080';
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const [shareUrl, setShareUrl] = useState('');

    const getImageUrl = (imgPath) => {
        console.log("Processing image path:", imgPath);
        if (!imgPath || imgPath === 'default.png') {
            console.log("Using default image");
            return postLogo;
        }
        if (imgPath.startsWith('http')) {
            console.log("Using full URL:", imgPath);
            return imgPath;
        }
        const url = `${BASE_URL}${imgPath}`;
        console.log("Constructed image URL:", url);
        return url;
    };

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                console.log(`Fetching post from ${BASE_URL}/api/posts/${postId}`);
                // Make request without authentication headers for public access
                const postResponse = await axios.get(`${BASE_URL}/api/posts/${postId}`);
                console.log("Post fetched:", postResponse.data);
                setPost(postResponse.data);
                
                // Set like status and counts
                if (postResponse.data && postResponse.data.likedBy) {
                    setLikeCount(postResponse.data.likedBy.length);
                    setIsLiked(currentUser && postResponse.data.likedBy.includes(currentUser.id));
                }
                
                setShareCount(postResponse.data.shareCount || 0);
                // Set share URL for this post
                setShareUrl(window.location.href);

                console.log(`Fetching comments from ${BASE_URL}/api/comments/post/${postId}`);
                // Make request without authentication headers for public access
                const commentsResponse = await axios.get(`${BASE_URL}/api/comments/post/${postId}`);
                console.log("Comments fetched:", commentsResponse.data);
                setComments(commentsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Failed to load data. Please check your connection.');
                setLoading(false);
            }
        };

        fetchPostAndComments();
    }, [postId, currentUser, navigate]);

    const handleLike = async () => {
        if (!currentUser) {
            navigate('/signin?redirect=' + encodeURIComponent(`/post/${postId}`));
            return;
        }
        
        try {
            console.log("Sending like request with token:", currentUser.token);
            const response = await axios.post(
                `${BASE_URL}/api/posts/${postId}/like`,
                {}, // Empty body
                {
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const updatedPost = response.data;
            console.log("Like response:", updatedPost);
            setPost(updatedPost);
            
            // Update like states
            if (updatedPost && updatedPost.likedBy) {
                setLikeCount(updatedPost.likedBy.length);
                setIsLiked(updatedPost.likedBy.includes(currentUser.id));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            console.error('Error response:', error.response?.data);
            setError('Failed to update like. Please try again.');
        }
    };

    const handleShare = async () => {
        try {
            // First, increment the share count on the server
            const response = await axios.post(`${BASE_URL}/api/posts/${postId}/share`);
            setShareCount(response.data.shareCount);
            
            // Then use the Web Share API if available
            if (navigator.share) {
                await navigator.share({
                    title: post.postName,
                    text: post.postDescription?.substring(0, 100) + '...',
                    url: window.location.href,
                });
            } else {
                // Fallback - copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing post:', error);
            // If Web Share API fails, try to copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (clipboardError) {
                console.error('Error copying to clipboard:', clipboardError);
                setError('Failed to share post. Please try again.');
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        // Check if user is authenticated
        if (!currentUser) {
            navigate('/signin?redirect=' + encodeURIComponent(`/post/${postId}`));
            return;
        }
        
        if (!newComment.trim()) {
            setError('Comment content cannot be empty');
            return;
        }

        try {
            console.log(`Posting comment to ${BASE_URL}/api/comments/post/${postId}`);
            const response = await axios.post(
                `${BASE_URL}/api/comments/post/${postId}`,
                { content: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                }
            );
            console.log("Comment posted:", response.data);
            setComments([...comments, response.data]);
            setNewComment('');
            setError(null);
        } catch (err) {
            console.error('Error posting comment:', err);
            setError(err.response?.data?.message || 'Failed to post comment.');
        }
    };

    const handleEditComment = async (commentId) => {
        if (!currentUser) {
            navigate('/signin?redirect=' + encodeURIComponent(`/post/${postId}`));
            return;
        }
        
        if (!editedContent.trim()) {
            setError('Comment content cannot be empty');
            return;
        }

        try {
            console.log(`Updating comment ${commentId} at ${BASE_URL}/api/comments/${commentId}`);
            const response = await axios.put(
                `${BASE_URL}/api/comments/${commentId}`,
                { content: editedContent },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                }
            );
            console.log("Comment updated:", response.data);
            setComments(
                comments.map((comment) =>
                    comment.id === commentId ? response.data : comment
                )
            );
            setEditingCommentId(null);
            setEditedContent('');
            setError(null);
        } catch (err) {
            console.error('Error updating comment:', err);
            setError(err.response?.data?.message || 'Failed to update comment.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!currentUser) {
            navigate('/signin?redirect=' + encodeURIComponent(`/post/${postId}`));
            return;
        }
        
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            console.log(`Deleting comment ${commentId} at ${BASE_URL}/api/comments/${commentId}`);
            await axios.delete(`${BASE_URL}/api/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });
            console.log("Comment deleted:", commentId);
            setComments(comments.filter((comment) => comment.id !== commentId));
            setError(null);
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError(err.response?.data?.message || 'Failed to delete comment.');
        }
    };

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        const fetchPostAndComments = async () => {
            try {
                console.log(`Retrying fetch post from ${BASE_URL}/api/posts/${postId}`);
                // Make request without authentication headers for public access
                const postResponse = await axios.get(`${BASE_URL}/api/posts/${postId}`);
                console.log("Post fetched on retry:", postResponse.data);
                setPost(postResponse.data);
                
                // Update like and share counts
                if (postResponse.data && postResponse.data.likedBy) {
                    setLikeCount(postResponse.data.likedBy.length);
                    setIsLiked(currentUser && postResponse.data.likedBy.includes(currentUser.id));
                }
                setShareCount(postResponse.data.shareCount || 0);

                console.log(`Retrying fetch comments from ${BASE_URL}/api/comments/post/${postId}`);
                // Make request without authentication headers for public access
                const commentsResponse = await axios.get(`${BASE_URL}/api/comments/post/${postId}`);
                console.log("Comments fetched on retry:", commentsResponse.data);
                setComments(commentsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error retrying fetch:', err);
                setError(err.response?.data?.message || 'Failed to load data. Please check your connection.');
                setLoading(false);
            }
        };
        fetchPostAndComments();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && error !== 'Comment content cannot be empty') {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-400 bg-gray-900">
                {error === "Post not found" ? "The requested post does not exist." : error}
                <Button onClick={handleRetry} className="mt-4" color="blue">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    {post?.postImg && post.postImg !== 'default.png' ? (
                        <div className="relative">
                            <img
                                className="w-full h-72 object-cover rounded-t-xl"
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
                        
                        {/* Like and Share buttons */}
                        <div className="flex items-center mt-6 space-x-4 border-t border-gray-700 pt-6">
                            <Button
                                color={isLiked ? "success" : "gray"}
                                className={`flex items-center px-6 py-2 ${isLiked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                                onClick={handleLike}
                            >
                                <HiThumbUp className="mr-2" /> 
                                {isLiked ? 'Liked' : 'Like'} 
                                {likeCount > 0 && (
                                    <span className="ml-2 bg-gray-800 text-white text-xs rounded-full px-2 py-1">
                                        {likeCount}
                                    </span>
                                )}
                            </Button>
                            
                            <Button
                                color="gray"
                                className="flex items-center px-6 py-2 bg-gray-700 hover:bg-gray-600"
                                onClick={handleShare}
                            >
                                <HiShare className="mr-2" /> 
                                Share
                                {shareCount > 0 && (
                                    <span className="ml-2 bg-gray-800 text-white text-xs rounded-full px-2 py-1">
                                        {shareCount}
                                    </span>
                                )}
                            </Button>
                            
                            <div className="flex items-center text-gray-400">
                                <HiUsers className="mr-1" /> 
                                <span className="text-sm">
                                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-3xl font-bold text-white mb-6">Comments</h2>

                    <div className="mb-8">
                        {currentUser ? (
                            <>
                                <Textarea
                                    className="w-full p-3 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                    rows="4"
                                    placeholder="Write your comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                {error === 'Comment content cannot be empty' && (
                                    <p className="text-red-400 text-sm mt-2">{error}</p>
                                )}
                                <Button
                                    color="blue"
                                    className="mt-3 rounded-full px-6 py-2"
                                    onClick={handleCommentSubmit}
                                >
                                    Post Comment
                                </Button>
                            </>
                        ) : (
                            <div className="bg-gray-700 p-4 rounded-lg text-center border border-gray-600">
                                <p className="flex items-center justify-center mb-3 text-gray-300">
                                    <HiLockClosed className="mr-2" /> Sign in to comment on this post
                                </p>
                                <Button
                                    color="blue"
                                    onClick={() => navigate('/signin?redirect=' + encodeURIComponent(`/post/${postId}`))}
                                >
                                    Sign In
                                </Button>
                            </div>
                        )}
                    </div>

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
                                        {currentUser && comment.userId === currentUser.id && (
                                            <div className="flex space-x-3">
                                                <Button
                                                    size="sm"
                                                    color="blue"
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
                                                    color="red"
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
                                            {error === 'Comment content cannot be empty' && (
                                                <p className="text-red-400 text-sm mt-2">{error}</p>
                                            )}
                                            <div className="flex space-x-3 mt-3">
                                                <Button
                                                    color="blue"
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