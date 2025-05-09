import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button, Textarea, Badge, Avatar } from 'flowbite-react';
import { 
    HiCalendar, 
    HiLockClosed, 
    HiThumbUp, 
    HiShare, 
    HiUsers, 
    HiUser, 
    HiOutlineClock,
    HiOutlinePencil
} from 'react-icons/hi';
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

// Format time elapsed since post creation
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        
        if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'} ago`;
        if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
    } catch (err) {
        return '';
    }
};

export default function PostPage() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [author, setAuthor] = useState(null);
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
        if (!imgPath || imgPath === 'default.png') {
            return postLogo;
        }
        if (imgPath.startsWith('http')) {
            return imgPath;
        }
        const url = `${BASE_URL}${imgPath}`;
        return url;
    };

    const getInitial = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const getRandomColorClass = (userId) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-red-500',
            'bg-yellow-500',
            'bg-pink-500',
            'bg-indigo-500',
        ];
        
        // Handle case where userId might be undefined
        if (!userId) return colors[0];
        
        // Simple hash function to generate a consistent color for each user
        const hash = typeof userId === 'string' ? 
            userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 
            0;
            
        return colors[hash % colors.length];
    };

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                // Fetch post data
                const postResponse = await axios.get(`${BASE_URL}/api/posts/${postId}`);
                setPost(postResponse.data);
                
                // Set like status and counts
                if (postResponse.data && postResponse.data.likedBy) {
                    setLikeCount(postResponse.data.likedBy.length);
                    setIsLiked(currentUser && postResponse.data.likedBy.includes(currentUser.id));
                }
                
                setShareCount(postResponse.data.shareCount || 0);
                // Set share URL for this post
                setShareUrl(window.location.href);
                
                // Enhanced author fetching with multiple fallbacks
                if (postResponse.data.userId) {
                    try {
                        // First try with original userId format
                        const authorResponse = await axios.get(`${BASE_URL}/api/user/${postResponse.data.userId}`);
                        setAuthor(authorResponse.data);
                    } catch (authorErr) {
                        console.error('Error fetching author with ID, trying alternative format:', authorErr);
                        
                        // Try with alternative ID format (some APIs use _id instead of id)
                        try {
                            const authorAltId = postResponse.data.userId.includes('_id') ? 
                                postResponse.data.userId : 
                                postResponse.data._id || postResponse.data.id;
                                
                            const authorAltResponse = await axios.get(`${BASE_URL}/api/user/${authorAltId}`);
                            setAuthor(authorAltResponse.data);
                        } catch (altErr) {
                            // If post has user data embedded, use that
                            if (postResponse.data.user) {
                                setAuthor(postResponse.data.user);
                            } else if (postResponse.data.username) {
                                // Last resort: check if username exists directly on the post
                                setAuthor({
                                    id: postResponse.data.userId,
                                    username: postResponse.data.username,
                                    profilePicture: null
                                });
                            } else if (postResponse.data.author) {
                                // Check if there's an author field
                                setAuthor(postResponse.data.author);
                            }
                        }
                    }
                } else if (postResponse.data.author) {
                    // Some APIs embed author directly
                    setAuthor(postResponse.data.author);
                } else if (postResponse.data.username) {
                    // If we have a username but no full author object
                    setAuthor({
                        id: postResponse.data._id || postResponse.data.id,
                        username: postResponse.data.username,
                        profilePicture: null
                    });
                }

                // Fetch comments
                const commentsResponse = await axios.get(`${BASE_URL}/api/comments/post/${postId}`);
                setComments(commentsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Failed to load data. Please check your connection.');
                setLoading(false);
            }
        };

        fetchPostAndComments();
    }, [postId, currentUser, BASE_URL]);

    const handleLike = async () => {
        if (!currentUser) {
            navigate('/signin?redirect=' + encodeURIComponent(`/post/${postId}`));
            return;
        }
        
        try {
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
            setPost(updatedPost);
            
            // Update like states
            if (updatedPost && updatedPost.likedBy) {
                setLikeCount(updatedPost.likedBy.length);
                setIsLiked(updatedPost.likedBy.includes(currentUser.id));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
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
            const response = await axios.post(
                `${BASE_URL}/api/comments/post/${postId}`,
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
            const response = await axios.put(
                `${BASE_URL}/api/comments/${commentId}`,
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
            await axios.delete(`${BASE_URL}/api/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });
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
                // Fetch post data
                const postResponse = await axios.get(`${BASE_URL}/api/posts/${postId}`);
                setPost(postResponse.data);
                
                // Update like and share counts
                if (postResponse.data && postResponse.data.likedBy) {
                    setLikeCount(postResponse.data.likedBy.length);
                    setIsLiked(currentUser && postResponse.data.likedBy.includes(currentUser.id));
                }
                setShareCount(postResponse.data.shareCount || 0);
                
                // Enhanced author fetching with multiple fallbacks
                if (postResponse.data.userId) {
                    try {
                        // First try with original userId format
                        const authorResponse = await axios.get(`${BASE_URL}/api/user/${postResponse.data.userId}`);
                        setAuthor(authorResponse.data);
                    } catch (authorErr) {
                        console.error('Error fetching author with ID, trying alternative format:', authorErr);
                        
                        // Try with alternative ID format (some APIs use _id instead of id)
                        try {
                            const authorAltId = postResponse.data.userId.includes('_id') ? 
                                postResponse.data.userId : 
                                postResponse.data._id || postResponse.data.id;
                                
                            const authorAltResponse = await axios.get(`${BASE_URL}/api/user/${authorAltId}`);
                            setAuthor(authorAltResponse.data);
                        } catch (altErr) {
                            // If post has user data embedded, use that
                            if (postResponse.data.user) {
                                setAuthor(postResponse.data.user);
                            } else if (postResponse.data.username) {
                                // Last resort: check if username exists directly on the post
                                setAuthor({
                                    id: postResponse.data.userId,
                                    username: postResponse.data.username,
                                    profilePicture: null
                                });
                            } else if (postResponse.data.author) {
                                // Check if there's an author field
                                setAuthor(postResponse.data.author);
                            }
                        }
                    }
                } else if (postResponse.data.author) {
                    // Some APIs embed author directly
                    setAuthor(postResponse.data.author);
                } else if (postResponse.data.username) {
                    // If we have a username but no full author object
                    setAuthor({
                        id: postResponse.data._id || postResponse.data.id,
                        username: postResponse.data.username,
                        profilePicture: null
                    });
                }

                // Fetch comments
                const commentsResponse = await axios.get(`${BASE_URL}/api/comments/post/${postId}`);
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
                    {/* Post Image */}
                    {post?.postImg && post.postImg !== 'default.png' ? (
                        <div className="relative">
                            <img
                                className="w-full h-72 object-cover rounded-t-xl"
                                src={getImageUrl(post.postImg)}
                                alt={post.postName}
                                onError={(e) => {
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
                    
                    {/* Author Information */}
                    <div className="mt-6 flex items-center">
                        {author ? (
                            <Link 
                                to={`/profile/${author.id || author._id}`} 
                                className="flex items-center hover:bg-gray-700 p-2 rounded-lg transition-colors"
                            >
                                {author.profilePicture ? (
                                    <img 
                                        src={author.profilePicture} 
                                        alt={author.username} 
                                        className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
                                    />
                                ) : (
                                    <div className={`flex items-center justify-center h-10 w-10 rounded-full text-white font-medium ${getRandomColorClass(author.id || author._id || 'default')}`}>
                                        {getInitial(author.username)}
                                    </div>
                                )}
                                <div className="ml-3">
                                    <p className="font-medium text-white">{author.username}</p>
                                    <div className="flex items-center text-gray-400 text-xs">
                                        <HiOutlineClock className="mr-1" /> 
                                        {formatTimeAgo(post.createdAt)}
                                        {author.isAdmin && (
                                            <Badge color="indigo" className="ml-2 px-2 py-0.5 text-xs">
                                                Admin
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center">
                                <div className={`flex items-center justify-center h-10 w-10 rounded-full bg-gray-600 text-white`}>
                                    <HiUser className="text-gray-300 h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium text-white">{post.username || "Anonymous User"}</p>
                                    <p className="text-gray-400 text-xs">{formatTimeAgo(post.createdAt)}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Edit button for post author */}
                        {currentUser && post.userId === currentUser.id && (
                            <Button
                                color="light"
                                size="xs"
                                className="ml-auto"
                                onClick={() => navigate(`/edit-post/${postId}`)}
                            >
                                <HiOutlinePencil className="mr-1" /> Edit Post
                            </Button>
                        )}
                    </div>
                    
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
                                        <div className="flex items-center">
                                            <div className={`flex items-center justify-center h-8 w-8 rounded-full text-white font-medium mr-2 ${getRandomColorClass(comment.userId)}`}>
                                                {getInitial(comment.username)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white text-lg">{comment.username}</p>
                                                <p className="text-gray-400 text-sm">
                                                    {formatDate(comment.createdAt)}
                                                </p>
                                            </div>
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
                                        <p className="text-gray-300 text-base pl-10">{comment.content}</p>
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