import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiPencil, HiTrash } from 'react-icons/hi';

export default function ShowLearn({ searchTerm = '' }) {
  const { currentUser } = useSelector((state) => state.user);
  const [learns, setLearns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearns = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/learns', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setLearns(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
        // Sample fallback data if API fails
        setLearns([
          {
            id: 1,
            learnName: 'Introduction to Architecture',
            learnCategory: 'Basic Design',
            learnDescription: 'This course provides an introduction to architectural concepts and principles.',
            learnImg: '/uploads/course1.jpg',
            createdAt: new Date().toISOString()
          }
        ]);
      }
    };

    fetchLearns();
  }, [currentUser]);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/learns/${courseId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setLearns(learns.filter(learn => learn.id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
        setError('Failed to delete course. Please try again.');
      }
    }
  };

  // Filter courses based on search term
  const filteredLearns = learns.filter(learn => 
    learn.learnName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    learn.learnCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learn.learnDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Spinner size="xl" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Course Management</h2>
        <Button 
          color="success" 
          onClick={() => navigate('/addlearn')}
        >
          Add New Course
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Course Name</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Description</th>
              <th scope="col" className="px-6 py-3">Created</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLearns.length > 0 ? (
              filteredLearns.map((learn) => (
                <tr key={learn.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {learn.learnName}
                  </td>
                  <td className="px-6 py-4">{learn.learnCategory || 'Uncategorized'}</td>
                  <td className="px-6 py-4">
                    {learn.learnDescription?.substring(0, 50)}
                    {learn.learnDescription?.length > 50 ? '...' : ''}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(learn.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="xs" color="info" onClick={() => navigate(`/editlearn/${learn.id}`)}>
                        <HiPencil className="mr-1" />Edit
                      </Button>
                      <Button size="xs" color="failure" onClick={() => handleDeleteCourse(learn.id)}>
                        <HiTrash className="mr-1" />Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">No courses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}