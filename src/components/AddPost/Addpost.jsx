import React, { useState } from 'react';
import { Button, Label, TextInput, Textarea, FileInput } from 'flowbite-react';
import axios from 'axios';

export default function AddPost() {
    const [formData, setFormData] = useState({
        postName: '',
        postCategory: '',
        postDescription: '',
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Handle text input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Create FormData object for multipart request
            const data = new FormData();
            data.append('postName', formData.postName);
            data.append('postCategory', formData.postCategory);
            data.append('postDescription', formData.postDescription);
            if (file) {
                data.append('file', file);
            }

            // Send POST request to backend
            const response = await axios.post('http://localhost:8080/api/posts', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Post created successfully!');
            console.log('Post created:', response.data);

            // Reset form
            setFormData({
                postName: '',
                postCategory: '',
                postDescription: '',
            });
            setFile(null);
        } catch (err) {
            console.error('Error creating post:', err);
            if (err.response) {
                setError(err.response.data || 'Failed to create post');
            } else if (err.request) {
                setError('Network error: Could not reach the backend');
            } else {
                setError('Error: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Post</h2>
            
            {success && <p className="text-green-500 mb-4">{success}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

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
                    {file && <p className="text-sm text-gray-500 mt-1">Selected: {file.name}</p>}
                </div>

                <Button
                    type="submit"
                    color="blue"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Post'}
                </Button>
            </form>
        </div>
    );
}