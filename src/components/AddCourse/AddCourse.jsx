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
            setTimeout(() => navigate('/displaycourse'), 1000); // Redirect to see the course
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.response?.data?.error || 'Failed to create course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 bg-[url('src/assets/home.jpg')] bg-cover bg-center bg-no-repeat">
            <Card className="w-full max-w-lg mx-auto shadow-lg rounded-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Lesson</h2>

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
        onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-Z0-9\s]*$/.test(value)) {
                handleChange(e); // Update the state only if the input is valid
            }
        }}
        placeholder="Lesson Name"
        required
        icon={HiBookOpen}
        className="mt-1"
        color={formData.courseName.trim() ? 'success' : 'gray'}
    />
    {!/^[a-zA-Z0-9\s]*$/.test(formData.courseName) && (
        <p className="text-sm text-red-500 mt-1">Symbols are not allowed. Please use only letters, numbers, and spaces.</p>
    )}
</div>

                        {/* PDF Upload */}
                        <div>
                            <Label htmlFor="pdfFile" value="Course PDF" className="text-gray-700 font-medium" />
                            <FileInput
                                id="pdfFile"
                                name="pdfFile"
                                onChange={handlePdfChange}
                                accept=".pdf"
                                placeholder="Lecture pdf"
                                className="mt-1"
                                helperText="PDF file (max 10MB)"
                            />
                            {pdfFile && <p className="text-sm text-gray-500 mt-1">Selected: {pdfFile.name}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" color="blue" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Lesson'}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}