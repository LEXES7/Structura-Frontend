import React, { useState } from 'react';
import { Button, Label, TextInput, Textarea, FileInput, Alert, Card, Select } from 'flowbite-react';
import { HiInformationCircle, HiCheckCircle, HiBookOpen, HiTag, HiPencil } from 'react-icons/hi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function AddLearn() {
    const [formData, setFormData] = useState({
        learnName: '',
        learnCategory: '',
        learnDescription: '',
    });
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setImagePreview(null);
        }
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
        if (!formData.learnName.trim() || !formData.learnCategory.trim() || !formData.learnDescription.trim()) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('learnName', formData.learnName);
            data.append('learnCategory', formData.learnCategory);
            data.append('learnDescription', formData.learnDescription);
            if (file) {
                data.append('file', file);
            } else {
                data.append('learnImg', 'default.png');
            }

            const response = await axios.post('/api/learns', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccess('Course created successfully!');
            console.log('Course created:', response.data);
            setFormData({ learnName: '', learnCategory: '', learnDescription: '' });
            setFile(null);
            setImagePreview(null);
            setTimeout(() => navigate('/displaylearn'), 1000); // Redirect to see the course
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('src/assets/home.jpg')] bg-cover bg-center bg-no-repeat">
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
                        {/* Learn Title */}
                        <div>
    <Label htmlFor="learnName" value="Course Title" className="text-gray-700 font-medium" />
    <TextInput
        id="learnName"
        name="learnName"
        value={formData.learnName}
        onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(value)) {
                handleChange(e); // Update the state only if the input is valid
            }
        }}
        placeholder="Course Name"
        required
        icon={HiBookOpen}
        className="mt-1"
        color={formData.learnName.trim() ? 'success' : 'gray'}
    />
    {!/^[a-zA-Z\s]*$/.test(formData.learnName) && (
        <p className="text-sm text-red-500 mt-1">Only letters are allowed. Please remove numbers or symbols.</p>
    )}
</div>
                        {/* Category Dropdown */}
                        <div>
                            <Label htmlFor="learnCategory" value="Category" className="text-gray-700 font-medium" />
                            <Select
                                id="learnCategory"
                                name="learnCategory"
                                value={formData.learnCategory}
                                onChange={handleChange}
                                required
                                icon={HiTag}
                                className="mt-1"
                                color={formData.learnCategory.trim() ? 'success' : 'gray'}
                            >
                                <option value="" disabled>Select a Level</option>
                                <option value="Beginner">Beginner Level</option>
                                <option value="Intermediate">Intermediate Level</option>
                                <option value="Advanced">Advanced Level</option>
                            </Select>
                        </div>

                        {/* Description */}
                        <div>
    <Label htmlFor="learnDescription" value="Description" className="text-gray-700 font-medium" />
    <Textarea
        id="learnDescription"
        name="learnDescription"
        value={formData.learnDescription}
        onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(value)) {
                handleChange(e); // Update the state only if the input is valid
            }
        }}
        placeholder="Describe your course"
        rows={4}
        required
        className="mt-1"
        color={formData.learnDescription.trim() ? 'success' : 'gray'}
    />
    {!/^[a-zA-Z\s]*$/.test(formData.learnDescription) && (
        <p className="text-sm text-red-500 mt-1">Only letters are allowed. Please remove numbers or symbols.</p>
    )}
</div>

                        {/* Image Upload */}
                        <div>
                            <Label htmlFor="file" value="Course Image" className="text-gray-700 font-medium" />
                            <FileInput
                                id="file"
                                name="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="mt-1"
                                helperText="JPG, PNG, or GIF (max 5MB)"
                            />
                            {imagePreview && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Course Preview"
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                </div>
                            )}
                            {file && <p className="text-sm text-gray-500 mt-1">Selected: {file.name}</p>}
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