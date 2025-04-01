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
        setFile(e.target.files[0]);
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
            if (file) data.append('file', file);

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
            navigate('/dashboard?tab=profile');
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.response?.data?.message || 'Failed to create post');
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
                <Button type="submit" color="blue" className="w-full" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Post'}
                </Button>
            </form>
        </div>
    );
}