import React, { useState } from 'react';
import { Button, Label, TextInput, FileInput, Alert, Card } from 'flowbite-react';
import { HiInformationCircle, HiCheckCircle, HiBookOpen } from 'react-icons/hi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function AddCourse() {
    const [formData, setFormData] = useState({
        courseName: '',
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePdfChange = (e) => {
        const selectedFile = e.target.files[0];
        setPdfFile(selectedFile);
    };

    const handleVideoChange = (e) => {
        const selectedFile = e.target.files[0];
        setVideoFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('You must be logged in to create a course.');
            setLoading(false);
            navigate('/login');
            return;
        }

        // Basic input validation
        if (!formData.courseName.trim()) {
            setError('Course name is required.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('courseName', formData.courseName);
            if (pdfFile) {
                data.append('pdfFile', pdfFile);
            }
            if (videoFile) {
                data.append('videoFile', videoFile);
            }

            const response = await axios.post('/api/courses', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccess('Course created successfully!');
            console.log('Course created:', response.data);
            setFormData({ courseName: '' });
            setPdfFile(null);
            setVideoFile(null);
            setTimeout(() => navigate('/displaycourse'), 1000); // Redirect to see the course
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.response?.data?.error || 'Failed to create course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg mx-auto shadow-lg rounded-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Course</h2>

                    {/* Success/Error Alerts */}
                    {success && (
                        <Alert color="success" icon={HiCheckCircle} className="mb-4">
                            {success}
                        </Alert>
                    )}
                    {error && (
                        <Alert color="failure" icon={HiInformationCircle} className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Course Name */}
                        <div>
                            <Label htmlFor="courseName" value="Course Title" className="text-gray-700 font-medium" />
                            <TextInput
                                id="courseName"
                                name="courseName"
                                value={formData.courseName}
                                onChange={handleChange}
                                placeholder="Lecture Name"
                                required
                                icon={HiBookOpen}
                                className="mt-1"
                                color={formData.courseName.trim() ? 'success' : 'gray'}
                            />
                        </div>

                        {/* PDF Upload */}
                        <div>
                            <Label htmlFor="pdfFile" value="Course PDF" className="text-gray-700 font-medium" />
                            <FileInput
                                id="pdfFile"
                                name="pdfFile"
                                onChange={handlePdfChange}
                                accept=".pdf"
                                 placeholder="Lecture Notes"
                                className="mt-1"
                                helperText="PDF file (max 10MB)"
                            />
                            {pdfFile && <p className="text-sm text-gray-500 mt-1">Selected: {pdfFile.name}</p>}
                        </div>

                        {/* Video Upload */}
                        <div>
                            <Label htmlFor="videoFile" value="Course Video" className="text-gray-700 font-medium" />
                            <FileInput
                                id="videoFile"
                                name="videoFile"
                                onChange={handleVideoChange}
                                accept="video/*"
                                className="mt-1"
                                 placeholder="Lecture Vedio"
                                helperText="MP4, AVI, or MOV (max 50MB)"
                            />
                            {videoFile && <p className="text-sm text-gray-500 mt-1">Selected: {videoFile.name}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" color="blue" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Course'}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}