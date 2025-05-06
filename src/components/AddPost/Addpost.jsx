import React, { useState } from 'react';
import { Button, Label, TextInput, Textarea, FileInput } from 'flowbite-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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

            const response = await axios.post('/api/posts', data, {
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
                navigate('/dashboard?tab=profile');
            }, 1500);
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.response?.data?.message || 'Failed to create post. Please check your form and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Post</h2>
            {success && <p className="text-green-500 mb-4 p-3 bg-green-50 rounded-md">{success}</p>}
            {error && <p className="text-red-500 mb-4 p-3 bg-red-50 rounded-md">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="postName" value="Post Title" className="text-gray-700" />
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
                    <Label htmlFor="postCategory" value="Category" className="text-gray-700" />
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
                    <Label htmlFor="postDescription" value="Description" className="text-gray-700" />
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
                    <Label htmlFor="file" value="Upload Image" className="text-gray-700" />
                    <FileInput
                        id="file"
                        name="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="mt-1"
                    />
                    {file && (
                        <div className="text-sm text-gray-500 mt-1">
                            <p>Selected: {file.name}</p>
                            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                            <p>Type: {file.type}</p>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Max file size: 10MB. Supported formats: JPG, PNG, GIF.
                    </p>
                </div>
                <Button type="submit" color="blue" className="w-full" disabled={loading}>
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Uploading...</span>
                        </div>
                    ) : 'Add Post'}
                </Button>
            </form>
        </div>
    );
}