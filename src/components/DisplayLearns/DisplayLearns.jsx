import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Label, TextInput, Textarea, Select } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function DisplayLearns({ isDashboard = false }) {
    const [learns, setLearns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingLearnId, setEditingLearnId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        learnName: '',
        learnCategory: '',
        learnDescription: '',
    });
    const [newImage, setNewImage] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLearns = async () => {
            try {
                const url = isDashboard ? '/api/learns/user' : '/api/learns';
                const config = isDashboard && token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(url, config);
                setLearns(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching learns:', err);
                setError('Failed to load learns.');
                setLoading(false);
            }
        };
        fetchLearns();
    }, [isDashboard, token]);

    const handleEditClick = (learn) => {
        console.log('Editing learn:', learn.id); // Debug log
        setEditingLearnId(learn.id);
        setEditFormData({
            learnName: learn.learnName || '',
            learnCategory: learn.learnCategory || '',
            learnDescription: learn.learnDescription || '',
        });
        setNewImage(null);
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleSaveEdit = async () => {
        if (!token) {
            setError('You must be logged in to edit learns.');
            return;
        }
        console.log('Saving edit for learn:', editingLearnId); // Debug log
        const formData = new FormData();
        formData.append('learnName', editFormData.learnName);
        formData.append('learnCategory', editFormData.learnCategory);
        formData.append('learnDescription', editFormData.learnDescription);
        if (newImage) {
            formData.append('file', newImage); // Match backend's expected key
        }

        try {
            const response = await axios.put(`/api/learns/${editingLearnId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setLearns(learns.map(learn => (learn.id === editingLearnId ? response.data : learn)));
            setEditingLearnId(null);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Error updating learn:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to update learn.');
        }
    };

    const handleCancelEdit = () => {
        setEditingLearnId(null);
        setNewImage(null);
        setError(null);
    };

    const handleDelete = async (learnId) => {
        if (!token) {
            setError('You must be logged in to delete learns.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this learn?')) {
            try {
                await axios.delete(`/api/learns/${learnId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLearns(learns.filter(learn => learn.id !== learnId));
                setError(null);
            } catch (err) {
                console.error('Error deleting learn:', err.response?.data || err.message);
                setError(err.response?.data?.error || 'Failed to delete learn.');
            }
        }
    };

    const handleAddLearn = () => {
        navigate('/addlearn');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-[url('src/assets/home.jpg')] bg-cover bg-center bg-no-repeat">
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            
           {/* Main Content */}
<div className="flex-1 p-6">
  <div className="flex justify-between items-center">
  <div>
                        <h1 className="text-3xl font-bold text-white">Courses</h1>
                        <p className="mt-4 text-white">
                            {isDashboard ? 'View and manage your courses.' : 'Explore all available courses.'}
                        </p>
                    </div>
    <Button color="green" onClick={handleAddLearn} className="ml-4">
      + Add Course
    </Button>
  </div>
</div>

            {editingLearnId && (
                <div className="mb-8 p-6 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
                    
                    <div className="mb-4">
                        <Label htmlFor="learnName" value="Learn Title" />
                        <TextInput
                            id="learnName"
                            name="learnName"
                            value={editFormData.learnName}
                            onChange={handleEditChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="learnCategory" value="Category" />
                        <Select
                            id="learnCategory"
                            name="learnCategory"
                            value={editFormData.learnCategory}
                            onChange={handleEditChange}
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </Select>
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="learnDescription" value="Description" />
                        <Textarea
                            id="learnDescription"
                            name="learnDescription"
                            value={editFormData.learnDescription}
                            onChange={handleEditChange}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label value="Current Image" />
                        <img
                            src={editFormData.learnImg && editFormData.learnImg !== 'default.png' 
                                ? `http://localhost:8080${editFormData.learnImg}` 
                                : 'https://placehold.co/150x150'}
                            alt="Current"
                            className="w-full h-32 object-cover rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="file" value="Upload New Image" />
                        <input
                            type="file"
                            id="file"
                            name="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button color="blue" onClick={handleSaveEdit}>Save</Button>
                        <Button color="red" onClick={handleCancelEdit}>Cancel</Button>
                    </div>
                </div>
            )}

            <div className="h-[500px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {learns.map((learn) => (
                    <div key={learn.id} className="bg-white rounded-lg shadow-md p-4">
                        {learn.learnImg && learn.learnImg !== 'default.png' ? (
                            <img
                                className="w-full h-48 object-cover mb-4"
                                src={`http://localhost:8080${learn.learnImg}`}
                                alt={learn.learnName}
                                onError={(e) => (e.target.src = 'https://placehold.co/150x150')}
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4">
                                <span className="text-gray-500">No Image</span>
                            </div>
                        )}
                        <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">{learn.learnName}</h2>
                        <p className="text-gray-600 text-sm mb-2">Category: {learn.learnCategory || 'Uncategorized'}</p>
                        <p className="text-gray-700 text-base line-clamp-2 mb-4">{learn.learnDescription || 'No description'}</p>
                        <div className="flex space-x-2">
                            <Button color="blue" size="sm" className="flex-1" onClick={() => handleEditClick(learn)}>Edit</Button>
                            <Button color="red" size="sm" className="flex-1" onClick={() => handleDelete(learn.id)}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}