import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Progress } from 'flowbite-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';

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

    // Calculate number of courses and lectures
    const totalCourses = courses.length;
    const totalLectures = courses.reduce((sum, course) => sum + (course.lectures || (course.coursePdf ? 1 : 0)), 0);

    // Generate and download PDF certificate
    const handleDownloadCertificate = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Colors
        const navyBlue = [0, 0, 128];
        const gold = [218, 165, 32];
        const black = [0, 0, 0];

        // Decorative Border
        doc.setDrawColor(...gold);
        doc.setLineWidth(1.5);
        doc.rect(8, 8, 194, 281); // Outer border
        doc.setDrawColor(...navyBlue);
        doc.setLineWidth(0.7);
        doc.rect(10, 10, 190, 277); // Inner border

        // Emblem (simulated with star-like shape and text)
        doc.setFillColor(...gold);
        doc.setDrawColor(...navyBlue);
        doc.setLineWidth(0.3);
        // Simple star shape using lines
        doc.line(100, 30, 105, 40);
        doc.line(105, 40, 110, 30);
        doc.line(110, 30, 107, 42);
        doc.line(107, 42, 103, 42);
        doc.line(103, 42, 100, 30);
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...navyBlue);
        doc.text('OLP', 105, 38, { align: 'center' }); // Online Learning Platform

        // Certificate Title
        doc.setFont('times', 'bold');
        doc.setFontSize(38);
        doc.setTextColor(...navyBlue);
        doc.text('Certificate of Completion', 105, 65, { align: 'center' });

        // Decorative Line
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(40, 70, 170, 70);

        // Body Text
        doc.setFont('times', 'italic');
        doc.setFontSize(20);
        doc.setTextColor(...black);
        doc.text('This is to certify that', 105, 90, { align: 'center' });

        // User Name
        doc.setFont('times', 'bold');
        doc.setFontSize(30);
        doc.setTextColor(...navyBlue);
        doc.text(currentUser?.name || 'Student', 105, 110, { align: 'center' });

        // Course Details
        doc.setFont('times', 'normal');
        doc.setFontSize(18);
        doc.setTextColor(...black);
        doc.text('has successfully completed the course', 105, 130, { align: 'center' });
        doc.setFont('times', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(...navyBlue);
        doc.text('Introduction to Architecture', 105, 150, { align: 'center' });

        // Completion Date
        doc.setFont('times', 'normal');
        doc.setFontSize(18);
        doc.setTextColor(...black);
        doc.text(`on ${new Date().toLocaleDateString()}`, 105, 170, { align: 'center' });

        // Issuer
        doc.setFont('times', 'italic');
        doc.setFontSize(16);
        doc.setTextColor(...black);
        doc.text('Awarded by: Online Learning Platform', 105, 195, { align: 'center' });

        // Signature Line
        doc.setDrawColor(...black);
        doc.setLineWidth(0.2);
        doc.line(75, 225, 135, 225);
        doc.setFont('times', 'normal');
        doc.setFontSize(14);
        doc.text('Authorized Signature', 105, 230, { align: 'center' });

        // Footer Note
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...black);
        doc.text('Certificate ID: ARCH-' + Math.floor(1000 + Math.random() * 9000), 105, 270, { align: 'center' });

        // Save the PDF
        doc.save('Certificate_Introduction_to_Architecture.pdf');
    };

    if (loading) {
        return <div className="h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="bg-gray-50 rounded-lg shadow-md p-4 h-[350px] flex flex-col">
                            <div className="items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-9">Introduction to Architecture</h1>
                                    <br />
                                    <div
                                        className="w-[400px] md:w-1/2 relative -ml-1/2 h-[250px] bg-[url('src/assets/main.jpeg')] bg-cover bg-no-repeat rounded-lg"
                                        style={{ backgroundPosition: '60% 50%' }}
                                    ></div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Progress Box */}
                    {totalProgress !== null && (
                        <div className="mb-4">
                            <Progress
                                progress={totalProgress}
                                color="green"
                                label={`${totalProgress.toFixed(0)}%`}
                                labelPosition="outside"
                                className="w-full max-w-md"
                            />
                        </div>
                    )}
                </div>
                <div className="bg-gradient-to-r from-red-100 via-yellow-100 to-gray-100 rounded-lg shadow-md p-4 relative w-full">
                    <h1 className="text-2xl font-bold text-gray-9">Course Content</h1>
                    <br />
                    {/* Display total courses and lectures */}
                    <p className="text-gray-600 mb-4">
                        {totalCourses} Sections . {totalLectures} lectures
                    </p>
                    <div className="grid grid-cols-1 gap-6 w-full">
                        {courses.map((course) => (
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
                        ))}
                    </div>
                </div>
                <br />
                <div className="bg-white rounded-lg shadow-md p-4 h-[350px] flex flex-col">
                    <div className="w-full md:w-1/2 text-left gap-4 md:pl-10">
                    <br></br>
                        <h2 className="text-3xl font-bold mb-4">Explore Iconic Architecture with Practical Skill Development</h2>
                        <p className="text-lg mb-6 line-clamp-2">
                            Our educational approach blends architectural appreciation with hands-on skill-building. Explore iconic structures through 3D rendering and drawing courses, and deepen your expertise by studying architectural marvels and industry giants.
                        </p>
                    </div>
                    {/* Finish and Certificate Buttons */}
                    <div className="mt-5 flex flex-col items-start gap-4 md:pl-10">
                        <Button
                            color="green"
                            onClick={handleFinish}
                            className="px-6 py-3 border border-black text-black font-semibold rounded-full hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:text-white transition"
                        >
                            Completed Successfully!
                        </Button>
                        {totalProgress === 100 && (
                            <Button
                                color="blue"
                                onClick={handleDownloadCertificate}
                                className="px-6 py-3 border border-black text-black font-semibold rounded-full hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:text-white transition"
                            >
                                Download Certificate
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}