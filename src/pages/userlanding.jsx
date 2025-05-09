import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Button, Badge } from 'flowbite-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    HiDocumentText, 
    HiThumbUp, 
    HiShare, 
    HiClock, 
    HiCalendar, 
    HiTrendingUp,
    HiOutlineEye,
    HiOutlineClipboardList
} from 'react-icons/hi';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    ArcElement,
    Title, 
    Tooltip, 
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function UserLanding() {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userStats, setUserStats] = useState({
        postsCount: 0,
        totalLikes: 0,
        totalShares: 0,
        likesByPost: [],
        sharesByPost: [],
        postsByCategory: {},
        recentPosts: [],
        activityTimeline: [],
        accountAge: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [eventError, setEventError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    
   
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);
    
    //greeting
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };
    
    // Format date as relative time 
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                if (diffHours === 0) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60));
                    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
                }
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 7) {
                return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 30) {
                const diffWeeks = Math.floor(diffDays / 7);
                return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 365) {
                const diffMonths = Math.floor(diffDays / 30);
                return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
            } else {
                const diffYears = Math.floor(diffDays / 365);
                return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
            }
        } catch (err) {
            return 'Unknown date';
        }
    };
    
    // Calculate account age (using sdays. )....
    const calculateAccountAge = (createdAt) => {
        if (!createdAt) return 0;
        const createDate = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - createDate);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };
    
    useEffect(() => {
        if (!currentUser?.token) {
            navigate('/signin');
            return;
        }
        
        const fetchUserData = async () => {
            setLoading(true);
            try {
                // Fetch user's posts
                const postsResponse = await axios.get('http://localhost:8080/api/posts/user', {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                
                const posts = Array.isArray(postsResponse.data) ? postsResponse.data : [];
                
                // Calculate statistics
                const totalLikes = posts.reduce((sum, post) => sum + (post.likedBy?.length || 0), 0);
                const totalShares = posts.reduce((sum, post) => sum + (post.shareCount || 0), 0);
                

                const likesByPost = posts.map(post => ({
                    name: post.postName,
                    count: post.likedBy?.length || 0,
                    id: post._id || post.id
                })).sort((a, b) => b.count - a.count);
                
                const sharesByPost = posts.map(post => ({
                    name: post.postName,
                    count: post.shareCount || 0,
                    id: post._id || post.id
                })).sort((a, b) => b.count - a.count);
                

                const postsByCategory = posts.reduce((acc, post) => {
                    const category = post.postCategory || 'Uncategorized';
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {});
                
                // Get most recent posts 
                const recentPosts = [...posts]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                
                // Generate activity timeline 
                const timeline = [];
                for (let i = 13; i >= 0; i--) {
                    const date = subDays(new Date(), i);
                    const formattedDate = format(date, 'MM/dd');
                    const postsOnDay = posts.filter(post => {
                        const postDate = new Date(post.createdAt);
                        return postDate.getDate() === date.getDate() && 
                               postDate.getMonth() === date.getMonth() && 
                               postDate.getFullYear() === date.getFullYear();
                    }).length;
                    
                    timeline.push({
                        date: formattedDate,
                        posts: postsOnDay
                    });
                }
                
                // Calculate account age
                const accountAge = calculateAccountAge(currentUser.createdAt);
                
                setUserStats({
                    postsCount: posts.length,
                    totalLikes,
                    totalShares,
                    likesByPost,
                    sharesByPost,
                    postsByCategory,
                    recentPosts,
                    activityTimeline: timeline,
                    accountAge
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.response?.data?.message || 'Failed to load your data');
                setLoading(false);
            }
        };
        
        const fetchUpcomingEvents = async () => {
            setLoadingEvents(true);
            try {
                const response = await axios.get('http://localhost:8080/api/events/upcoming', {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                
                const events = Array.isArray(response.data) ? response.data : [];
                events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                setUpcomingEvents(events);
                setEventError(null);
            } catch (err) {
                console.error('Error fetching events:', err);
                setEventError('Could not load upcoming events');
            } finally {
                setLoadingEvents(false);
            }
        };
        
        fetchUserData();
        fetchUpcomingEvents();
    }, [currentUser, navigate]);
    
    // Prepare chart data
    const activityChartData = {
        labels: userStats.activityTimeline.map(item => item.date),
        datasets: [
            {
                label: 'Posts',
                data: userStats.activityTimeline.map(item => item.posts),
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                tension: 0.4
            }
        ]
    };
    
    const likesChartData = {
        labels: userStats.likesByPost.slice(0, 5).map(item => item.name.substring(0, 15) + (item.name.length > 15 ? '...' : '')),
        datasets: [
            {
                label: 'Likes',
                data: userStats.likesByPost.slice(0, 5).map(item => item.count),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderWidth: 1
            }
        ]
    };
    
    const categoryChartData = {
        labels: Object.keys(userStats.postsByCategory),
        datasets: [
            {
                label: 'Posts by Category',
                data: Object.values(userStats.postsByCategory),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                hoverOffset: 4
            }
        ]
    };
    
    const formatEventTime = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return format(date, 'MMM dd, yyyy • h:mm a');
        } catch (err) {
            return 'Invalid date';
        }
    };
    
    const formatEventCountdown = (dateString) => {
        if (!dateString) return '';
        
        try {
            const eventDate = new Date(dateString);
            const now = new Date();
            const diffMs = eventDate - now;
            
            if (diffMs <= 0) return 'Event has started';
            
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (diffDays > 0) {
                return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
            } else {
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
            }
        } catch (err) {
            return '';
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-64">
                <Spinner size="xl" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                    <p>{error}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-6 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        <span className="text-blue-600">{getGreeting()}, {currentUser?.username}!</span>
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Here's what's happening with your content
                    </p>
                </div>
                
                <div className="text-right">
                    <div className="text-lg font-bold text-gray-700">
                        {format(currentTime, 'h:mm a')}
                    </div>
                    <div className="text-sm text-gray-500">
                        {format(currentTime, 'EEEE, MMMM d, yyyy')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Posts</p>
                            <h5 className="text-3xl font-bold text-gray-900">{userStats.postsCount}</h5>
                            <p className="text-xs mt-1 text-gray-500">
                                {userStats.postsCount > 0 
                                    ? `Latest post ${formatRelativeTime(userStats.recentPosts[0]?.createdAt)}` 
                                    : 'No posts yet'
                                }
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <HiDocumentText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>
                
                {/* Likes count */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Likes</p>
                            <h5 className="text-3xl font-bold text-gray-900">{userStats.totalLikes}</h5>
                            <p className="text-xs mt-1 text-gray-500">
                                {userStats.likesByPost.length > 0 
                                    ? `Most liked: ${userStats.likesByPost[0].name.substring(0, 15)}${userStats.likesByPost[0].name.length > 15 ? '...' : ''} (${userStats.likesByPost[0].count})` 
                                    : 'No likes yet'
                                }
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <HiThumbUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>
                
                {/* Shares count */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Shares</p>
                            <h5 className="text-3xl font-bold text-gray-900">{userStats.totalShares}</h5>
                            <p className="text-xs mt-1 text-gray-500">
                                {userStats.sharesByPost.length > 0 && userStats.sharesByPost[0].count > 0
                                    ? `Most shared: ${userStats.sharesByPost[0].name.substring(0, 15)}${userStats.sharesByPost[0].name.length > 15 ? '...' : ''} (${userStats.sharesByPost[0].count})` 
                                    : 'No shares yet'
                                }
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <HiShare className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Activity Timeline Chart */}
                <Card className="lg:col-span-2">
                    <h5 className="text-xl font-bold mb-2 text-gray-900">Recent Activity</h5>
                    <p className="text-sm text-gray-500 mb-4">Your posting activity over the last 14 days</p>
                    <div className="h-64">
                        <Line 
                            data={activityChartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const value = context.raw;
                                                return `${value} post${value !== 1 ? 's' : ''}`;
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            precision: 0,
                                            stepSize: 1
                                        }
                                    }
                                }
                            }} 
                        />
                    </div>
                </Card>
                
                {/* Category Distribution */}
                <Card>
                    <h5 className="text-xl font-bold mb-2 text-gray-900">Content Categories</h5>
                    <p className="text-sm text-gray-500 mb-4">Distribution of your posts by category</p>
                    {Object.keys(userStats.postsByCategory).length > 0 ? (
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut 
                                data={categoryChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                boxWidth: 12,
                                                font: {
                                                    size: 10
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No categories to display
                        </div>
                    )}
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Likes by Post Chart */}
                <Card>
                    <h5 className="text-xl font-bold mb-2 text-gray-900">Top Liked Posts</h5>
                    <p className="text-sm text-gray-500 mb-4">Your most popular content</p>
                    {userStats.likesByPost.length > 0 ? (
                        <div className="h-64">
                            <Bar 
                                data={likesChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No likes data to display
                        </div>
                    )}
                </Card>
                
                {/* Recent Posts List */}
                <Card>
                    <h5 className="text-xl font-bold mb-2 text-gray-900">Recent Posts</h5>
                    <p className="text-sm text-gray-500 mb-4">Your latest content</p>
                    
                    <div className="overflow-y-auto max-h-64">
                        {userStats.recentPosts.length > 0 ? (
                            <ul className="space-y-3">
                                {userStats.recentPosts.map((post) => (
                                    <li 
                                        key={post._id || post.id}
                                        className="flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/post/${post._id || post.id}`)}
                                    >
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                            <HiDocumentText className="text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {post.postName}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <Badge color="gray" className="mr-2">
                                                    {post.postCategory || 'Uncategorized'}
                                                </Badge>
                                                <p className="text-xs text-gray-500">
                                                    {formatRelativeTime(post.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end text-xs text-gray-500">
                                            <div className="flex items-center mb-1">
                                                <HiThumbUp className="mr-1" /> 
                                                {post.likedBy?.length || 0}
                                            </div>
                                            <div className="flex items-center">
                                                <HiShare className="mr-1" /> 
                                                {post.shareCount || 0}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <HiDocumentText className="mx-auto h-8 w-8 mb-2" />
                                <p>No posts yet</p>
                                <Button 
                                    size="sm"
                                    color="blue"
                                    className="mt-3"
                                    onClick={() => navigate('/addpost')}
                                >
                                    Create Your First Post
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
                
                {/* Upcoming Events */}
                <Card>
                    <div className="flex justify-between items-center mb-2">
                        <h5 className="text-xl font-bold text-gray-900">Upcoming Events</h5>
                        <Button 
                            size="xs"
                            color="light"
                            onClick={() => navigate('/dashboard?tab=events')}
                        >
                            View Calendar
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Stay updated with upcoming activities</p>
                    
                    {loadingEvents ? (
                        <div className="flex justify-center items-center h-40">
                            <Spinner size="md" />
                        </div>
                    ) : eventError ? (
                        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
                            {eventError}
                        </div>
                    ) : upcomingEvents.length > 0 ? (
                        <div className="overflow-y-auto max-h-64 pr-1">
                            <ul className="space-y-3">
                                {upcomingEvents.map((event, index) => (
                                    <li key={event.id || index} className="p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-start gap-2">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <HiCalendar className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900">
                                                    {event.title || 'Untitled Event'}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 flex items-center">
                                                    <HiClock className="mr-1" />
                                                    {formatEventTime(event.startTime)}
                                                </p>
                                                {event.category && (
                                                    <Badge color="blue" className="mt-2">
                                                        {event.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                                            <HiTrendingUp className="mr-1" />
                                            <span>Starting in {formatEventCountdown(event.startTime)}</span>
                                        </div>
                                        {event.description && (
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}
                                        {event.zoomLink && (
                                            <a 
                                                href={event.zoomLink} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 text-sm text-blue-600 hover:underline inline-block"
                                            >
                                                Join Meeting
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <HiCalendar className="mx-auto h-8 w-8 mb-2" />
                            <p>No upcoming events</p>
                        </div>
                    )}
                </Card>
            </div>
            
            {/* Account Stats */}
            <Card className="mb-8">
                <h5 className="text-xl font-bold mb-4 text-gray-900">Account Stats</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full mr-4">
                            <HiOutlineClipboardList className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Posts per Category</p>
                            <p className="text-lg font-bold text-gray-900">
                                {Object.keys(userStats.postsByCategory).length}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full mr-4">
                            <HiOutlineEye className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Average Likes per Post</p>
                            <p className="text-lg font-bold text-gray-900">
                                {userStats.postsCount > 0 
                                    ? (userStats.totalLikes / userStats.postsCount).toFixed(1) 
                                    : '0'
                                }
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                            <HiClock className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Account Age</p>
                            <p className="text-lg font-bold text-gray-900">
                                {userStats.accountAge} days
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6">
                    <Button onClick={() => navigate('/addpost')} color="blue">
                        Create New Post
                    </Button>
                </div>
            </Card>
        </div>
    );
}