import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Progress } from 'flowbite-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Course() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({}); // Tracks progress per course
    const [totalProgress, setTotalProgress] = useState(null); // Tracks overall progress, null until Finish clicked
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we're in dashboard mode based on route
    const isDashboard = location.pathname === '/displaycourse';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const url = isDashboard ? '/api/courses/user' : '/api/courses';
                const config = isDashboard && token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(url, config);
                setCourses(response.data);
                // Initialize progress for each course
                const initialProgress = {};
                response.data.forEach((course) => {
                    initialProgress[course.id] = 0; // Start at 0% for each course
                });
                setProgress(initialProgress);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses.');
                setLoading(false);
            }
        };
        fetchCourses();
    }, [isDashboard, token]);

    const handleCompleteCourse = (courseId) => {
        setProgress((prev) => ({
            ...prev,
            [courseId]: prev[courseId] >= 10 ? 0 : 10, // Toggle between 10% and 0%
        }));
    };

    const handleFinish = () => {
        const sumProgress = Object.values(progress).reduce((sum, p) => sum + p, 0);
        const totalCourses = courses.length;
        const maxProgress = totalCourses * 10; // Max is 10% per course
        const newTotalProgress = maxProgress > 0 ? (sumProgress / maxProgress) * 100 : 0;
        setTotalProgress(newTotalProgress);
    };

    const handleAddCourse = () => {
        navigate('/addcourse');
    };

    const handleSignOut = () => {
        // Placeholder for sign-out logic (adjust based on your Redux setup)
        navigate('/login');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
                   {/* Sidebar */}
                   <div className="w-64 bg-black text-white flex flex-col fixed h-full">
                       <div className="p-4 text-2xl font-bold border-b border-gray-700">
                           Online Learning
                       </div>
                       <nav className="flex-1 p-4">
                           <ul className="space-y-4">
                               <li>
                                   <Link
                                       to="/displaylearn"
                                       className={`block p-2 rounded hover:bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 ${
                                           isDashboard ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600' : ''
                                       }`}
                                   >
                                       My Courses
                                   </Link>
                               </li>
                               <li>
                                   <Link
                                       to="/displaycourse"
                                       className={`block p-2 rounded hover:bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 ${
                                           isDashboard ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600' : ''
                                       }`}
                                   >
                                       My Lessons
                                   </Link>
                               </li>
                               <li>
                                   <Link
                                       to="/learn"
                                       className={`block p-2 rounded hover:bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 ${
                                           !isDashboard ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600' : ''
                                       }`}
                                   >
                                       Explore Learnings
                                   </Link>
                               </li>
                           </ul>
                       </nav>
                       <div className="p-4 border-t border-gray-700">
                           <button
                               className="w-full p-2 bg-red-600 rounded hover:bg-red-700"
                               onClick={handleSignOut}
                           >
                               Sign Out
                           </button>
                       </div>
                   </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="flex-1 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Best Online Courses</h1>
                            <p className="mt-4 text-gray-600">
                                These free online courses will teach you valuable skills to enhance your knowledge and career. Explore a variety of topics designed to make learning accessible and engaging.
                            </p>
                        </div>
                    </div>
                    <br />
                    
                    {/* Total Progress Box */}
                    {totalProgress !== null && (
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Overall Progress</h2>
                            <Progress
                                progress={totalProgress}
                                color="green"
                                label={`${totalProgress.toFixed(0)}%`}
                                labelPosition="outside"
                                className="w-full max-w-md"
                            />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Most Popular Courses</h1>
                    </div>
                </div>
                <div className="overflow-y-auto grid grid-cols-1 gap-6 w-full">
                    {courses.map((course) => (
                         <div  className="bg-gradient-to-r from-red-100 via-yellow-100 to-gray-100 rounded-lg shadow-md p-4 relative w-full">
                        <div key={course.id} className="bg-white rounded-lg shadow-md p-4 relative w-full">
                            {/* Completion Box */}
                            <div
                                className={`absolute top-4 right-4 w-6 h-6 border-2 cursor-pointer ${
                                    progress[course.id] >= 10 ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                                }`}
                                onClick={() => handleCompleteCourse(course.id)}
                                title={progress[course.id] >= 10 ? 'Mark as incomplete' : 'Mark as completed (10%)'}
                            />
                            {/* Individual Progress Percentage */}
                            <p className="absolute top-12 right-4 text-xs text-gray-600">
                                {progress[course.id]}%
                            </p>
                            
                            <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">
                                {course.courseName}
                            </h2>
                            {course.coursePdf && (
                                <p className="text-gray-600 text-sm mb-2">
                                    <a
                                        href={`http://localhost:8080${course.coursePdf}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Lecture PDF
                                    </a>
                                </p>
                            )}
                        </div>
                        </div>
                    ))}
                </div>
               
                {/* Finish Button */}
                <div className="mt-5 flex justify-center">
                    <Button
                        color="green"
                        onClick={handleFinish}
                        className="w-full max-w-xs"
                    >
                        Completed Successfully!
                    </Button>
                </div>
            </div>
        </div>
    );
}