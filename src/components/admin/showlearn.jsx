import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Label, TextInput, Textarea, Select } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function showlearns({ isDashboard = false }) {
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
=======
import { Button, Spinner, Badge, Alert } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiPencil, HiTrash, HiOutlineCalendar, HiOutlineExclamation, HiEye, HiAcademicCap } from 'react-icons/hi';

export default function ShowLearn({ searchTerm = '' }) {
  const { currentUser } = useSelector((state) => state.user);
  const [learns, setLearns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [learnToDelete, setLearnToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearns = async () => {
      setLoading(true);
      try {
        // Get all courses
        const response = await axios.get('/api/learns', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        
        const fetchedLearns = response.data;
        setLearns(fetchedLearns);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(fetchedLearns.map(learn => learn.learnCategory || 'Uncategorized'))];
        setCategories(['All', ...uniqueCategories]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
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
        <div className="container mx-auto px-4 py-8">
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-black">Course Management</h1>
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
                                className="w-full h-48 object-cover mb-4 rounded"
                                src={`http://localhost:8080${learn.learnImg}`}
                                alt={learn.learnName}
                                onError={(e) => (e.target.src = 'https://placehold.co/150x150')}
                            />
                        ) : (
                            <div
                                className={`w-full h-48 mb-4 rounded flex items-center justify-center 
                                    ${learn.learnCategory === 'Beginner' 
                                        ? 'bg-[url("src/assets/home.jpg")] bg-cover bg-center bg-no-repeat' 
                                        : learn.learnCategory === 'Intermediate' 
                                        ? 'bg-[url("src/assets/img.jpg")] bg-cover bg-center bg-no-repeat' 
                                        : learn.learnCategory === 'Advanced' 
                                        ? 'bg-[url("src/assets/image.jpeg")] bg-cover bg-center bg-no-repeat' 
                                        : 'bg-gray-200'}`}
                            />
                        )}
                        <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">{learn.learnName}</h2>
                        <p className="text-gray-600 text-sm mb-2"> {learn.learnCategory || 'Uncategorized'} Level</p>
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
=======
  const handleDeleteClick = (learn) => {
    setLearnToDelete(learn);
    setConfirmDelete(true);
  };

  const confirmDeleteCourse = async () => {
    try {
      await axios.delete(`/api/learns/${learnToDelete.id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      
      setLearns(learns.filter(learn => learn.id !== learnToDelete.id));
      setSuccess(`Course "${learnToDelete.learnName}" deleted successfully`);
      setLearnToDelete(null);
      setConfirmDelete(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Failed to delete course. Please try again.');
      setConfirmDelete(false);
    }
  };

  const cancelDelete = () => {
    setLearnToDelete(null);
    setConfirmDelete(false);
  };

  // Apply filters
  const filteredLearns = learns.filter(learn => {
    // Apply category filter
    const categoryMatch = categoryFilter === 'All' || learn.learnCategory === categoryFilter;
    
    // Apply search term
    const searchMatch = searchTerm === '' || 
      learn.learnName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      learn.learnDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <Alert color="failure" className="mb-4" icon={HiOutlineExclamation}>
          <span className="font-medium">Error!</span> {error}
        </Alert>
      )}
      
      {success && (
        <Alert color="success" className="mb-4">
          <span className="font-medium">Success!</span> {success}
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Course Management ({filteredLearns.length})</h2>
        <Button 
          color="success" 
          className="flex items-center"
          onClick={() => navigate('/addlearn')}
        >
          <HiAcademicCap className="mr-2" /> Add New Course
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <Badge 
            key={category} 
            color={categoryFilter === category ? "success" : "gray"}
            className="cursor-pointer px-3 py-1.5 text-xs font-medium"
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Course Name</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Description</th>
              <th scope="col" className="px-6 py-3">Author</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLearns.length > 0 ? (
              filteredLearns.map((learn) => (
                <tr key={learn.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                        {learn.learnImg && learn.learnImg !== 'default.png' ? (
                          <img 
                            src={`http://localhost:8080${learn.learnImg}`} 
                            alt={learn.learnName} 
                            className="h-10 w-10 object-cover rounded-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=Course";
                            }}
                          />
                        ) : (
                          <HiAcademicCap className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <span className="max-w-xs truncate">{learn.learnName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color="purple" className="px-2 py-1">
                      {learn.learnCategory || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="line-clamp-2">
                      {learn.learnDescription || 'No description available'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {learn.userName || 'Admin User'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button size="xs" color="info" className="flex items-center" onClick={() => navigate(`/course/${learn.id}`)}>
                        <HiEye className="mr-1" /> View
                      </Button>
                      <Button size="xs" color="warning" className="flex items-center" onClick={() => navigate(`/editlearn/${learn.id}`)}>
                        <HiPencil className="mr-1" /> Edit
                      </Button>
                      <Button size="xs" color="failure" className="flex items-center" onClick={() => handleDeleteClick(learn)}>
                        <HiTrash className="mr-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  {searchTerm || categoryFilter !== 'All' 
                    ? "No courses match your filter criteria" 
                    : "No courses found in the database"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && learnToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete Course
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the course <span className="font-bold">"{learnToDelete.learnName}"</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <Button color="gray" onClick={cancelDelete}>Cancel</Button>
              <Button color="failure" onClick={confirmDeleteCourse}>
                Yes, Delete Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}