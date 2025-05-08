import React, { useState } from 'react';
import { Button, Label, TextInput, Textarea, FileInput } from 'flowbite-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashSidebar from '../../components/DashSidebar';

export default function Addpost() {
    const [formData, setFormData] = useState({
        postName: '',
        postCategory: '',
        postDescription: '',
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { currentUser } = useSelector(state => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        // Log file info for debugging
        if (selectedFile) {
            console.log("Selected file:", {
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type,
                lastModified: new Date(selectedFile.lastModified).toISOString()
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('You must be logged in to create a post.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('postName', formData.postName);
            data.append('postCategory', formData.postCategory);
            data.append('postDescription', formData.postDescription);
            
            if (file) {
                data.append('file', file);
                console.log("Attaching file to form data:", file.name);
            }

            console.log('Submitting form data:', {
                postName: formData.postName,
                postCategory: formData.postCategory,
                postDescription: formData.postDescription,
                fileIncluded: !!file,
                fileSize: file ? file.size : 'No file'
            });

            const response = await axios.post('http://localhost:8080/api/posts', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });

            setSuccess('Post created successfully!');
            console.log('Post created:', response.data);
            setFormData({ postName: '', postCategory: '', postDescription: '' });
            setFile(null);
            
            // Short delay before navigation to show success message
            setTimeout(() => {
                navigate('/dashboard?tab=displaypost');
            }, 1500);
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.response?.data?.message || 'Failed to create post. Please check your form and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-64">
                <DashSidebar />
            </div>
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Post</h1>
                
                <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 border border-gray-200">
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md border border-green-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    )}
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md border border-red-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="postName" value="Post Title" className="text-gray-700 font-medium" />
                            <TextInput
                                id="postName"
                                name="postName"
                                value={formData.postName}
                                onChange={handleChange}
                                placeholder="e.g., My Awesome Post"
                                required
                                className="mt-1"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="postCategory" value="Category" className="text-gray-700 font-medium" />
                            <TextInput
                                id="postCategory"
                                name="postCategory"
                                value={formData.postCategory}
                                onChange={handleChange}
                                placeholder="e.g., Technology"
                                required
                                className="mt-1"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="postDescription" value="Description" className="text-gray-700 font-medium" />
                            <Textarea
                                id="postDescription"
                                name="postDescription"
                                value={formData.postDescription}
                                onChange={handleChange}
                                placeholder="Describe your post..."
                                rows={4}
                                required
                                className="mt-1"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="file" value="Upload Image" className="text-gray-700 font-medium" />
                            <FileInput
                                id="file"
                                name="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="mt-1"
                            />
                            {file && (
                                <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                    <p className="font-medium">Selected File:</p>
                                    <p>Name: {file.name}</p>
                                    <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                                    <p>Type: {file.type}</p>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Max file size: 10MB. Supported formats: JPG, PNG, GIF.
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4">
                            <Button 
                                type="button" 
                                color="light"
                                onClick={() => navigate('/dashboard?tab=displaypost')}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                color="blue" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        <span>Uploading...</span>
                                    </div>
                                ) : 'Create Post'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}