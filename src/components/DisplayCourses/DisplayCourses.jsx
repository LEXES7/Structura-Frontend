import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Label, TextInput, FileInput, Alert } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function DisplayCourses({ isDashboard = false }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        courseName: '',
    });
    const [newPdfFile, setNewPdfFile] = useState(null);
    const [newVideoFile, setNewVideoFile] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const url = isDashboard ? '/api/courses/user' : '/api/courses';
                const config = isDashboard && token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(url, config);
                setCourses(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses.');
                setLoading(false);
            }
        };
        fetchCourses();
    }, [isDashboard, token]);

    const handleEditClick = (course) => {
        console.log('Editing course:', course.id);
        setEditingCourseId(course.id);
        setEditFormData({
            courseName: course.courseName || '',
        });
        setNewPdfFile(null);
        setNewVideoFile(null);
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handlePdfChange = (e) => {
        setNewPdfFile(e.target.files[0]);
    };

    const handleVideoChange = (e) => {
        setNewVideoFile(e.target.files[0]);
    };

    const handleSaveEdit = async () => {
        if (!token) {
            setError('You must be logged in to edit courses.');
            return;
        }
        console.log('Saving edit for course:', editingCourseId);
        const formData = new FormData();
        formData.append('courseName', editFormData.courseName);
        if (newPdfFile) {
            formData.append('pdfFile', newPdfFile);
        }
        if (newVideoFile) {
            formData.append('videoFile', newVideoFile);
        }

        try {
            const response = await axios.put(`/api/courses/${editingCourseId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setCourses(courses.map(course => (course.id === editingCourseId ? response.data : course)));
            setEditingCourseId(null);
            setError(null);
        } catch (err) {
            console.error('Error updating course:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to update course.');
        }
    };

    const handleCancelEdit = () => {
        setEditingCourseId(null);
        setNewPdfFile(null);
        setNewVideoFile(null);
        setError(null);
    };

    const handleDelete = async (courseId) => {
        if (!token) {
            setError('You must be logged in to delete courses.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/api/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCourses(courses.filter(course => course.id !== courseId));
                setError(null);
            } catch (err) {
                console.error('Error deleting course:', err.response?.data || err.message);
                setError(err.response?.data?.error || 'Failed to delete course.');
            }
        }
    };

    const handleAddCourse = () => {
        navigate('/addcourse');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {error && (
                <Alert color="failure" icon={HiInformationCircle} className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
                        <p className="mt-4 text-gray-600">
                            {isDashboard ? 'View and manage your courses.' : 'Explore all available courses.'}
                        </p>
                    </div>
                   
                        <Button color="green" onClick={handleAddCourse} className="ml-4">
                            + Add Lesson
                        </Button>
                  
                </div>
            </div>

            {editingCourseId && (
                <div className="mb-8 p-6 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
                    <div className="mb-4">
                        <Label htmlFor="courseName" value="Course Title" />
                        <TextInput
                            id="courseName"
                            name="courseName"
                            value={editFormData.courseName}
                            onChange={handleEditChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="pdfFile" value="Upload New PDF" />
                        <FileInput
                            id="pdfFile"
                            name="pdfFile"
                            accept=".pdf"
                            onChange={handlePdfChange}
                            className="block w-full"
                            helperText="PDF file (max 10MB)"
                        />
                        {newPdfFile && <p className="text-sm text-gray-500 mt-1">Selected: {newPdfFile.name}</p>}
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="videoFile" value="Upload New Video" />
                        <FileInput
                            id="videoFile"
                            name="videoFile"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="block w-full"
                            helperText="MP4, AVI, or MOV (max 50MB)"
                        />
                        {newVideoFile && <p className="text-sm text-gray-500 mt-1">Selected: {newVideoFile.name}</p>}
                    </div>
                    <div className="flex space-x-2">
                        <Button color="blue" onClick={handleSaveEdit}>Save</Button>
                        <Button color="red" onClick={handleCancelEdit}>Cancel</Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">{course.courseName}</h2>
                        {course.coursePdf && (
                            <div className="mb-2">
                                <a
                                    href={`http://localhost:8080${course.coursePdf}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    View PDF
                                </a>
                            </div>
                        )}
                        {course.courseVideo && (
                            <div className="mb-4">
                                <video
                                    className="w-full h-48 object-cover rounded"
                                    controls
                                    src={`http://localhost:8080${course.courseVideo}`}
                                    onError={(e) => (e.target.style.display = 'none')}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                       
                            <div className="flex space-x-2">
                                <Button color="blue" size="sm" className="flex-1" onClick={() => handleEditClick(course)}>
                                    Edit
                                </Button>
                                <Button color="red" size="sm" className="flex-1" onClick={() => handleDelete(course.id)}>
                                    Delete
                                </Button>
                            </div>
                      
                    </div>
                ))}
            </div>
        </div>
    );
}