import React, { useState } from 'react';
import { Button, Label, TextInput, Textarea } from 'flowbite-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AddEventForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    zoomLink: '',
    category: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { currentUser } = useSelector((state) => state.user || {});
  const token = currentUser?.token;

  console.log('Redux State in AddEventForm:', { currentUser, token });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Format datetime-local value to ISO 8601 (e.g., "2025-04-03T02:15:00")
    const formattedValue = name === 'startTime' || name === 'endTime' 
      ? value + ':00' // Append seconds to match "yyyy-MM-dd'T'HH:mm:ss"
      : value;
    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('No authentication token found. Please log in.');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      return;
    }

    const payload = new URLSearchParams(formData).toString();
    console.log('Request Payload:', payload);

    try {
      const response = await axios.post(
        '/api/events', // Using proxy URL from vite.config.js
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log('Response Data:', response.data);
      setSuccess('Event created successfully!');
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        zoomLink: '',
        category: '',
      });
    } catch (err) {
      console.error('Axios Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
      const errorMessage =
        err.response?.data?.message || err.message || 'Network Error';
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Event</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" value="Event Title" />
          <TextInput
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter event title"
          />
        </div>
        <div>
          <Label htmlFor="description" value="Description" />
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Enter event description"
          />
        </div>
        <div>
          <Label htmlFor="startTime" value="Start Time" />
          <TextInput
            id="startTime"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime" value="End Time (Optional)" />
          <TextInput
            id="endTime"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="zoomLink" value="Zoom Link (Optional)" />
          <TextInput
            id="zoomLink"
            name="zoomLink"
            value={formData.zoomLink}
            onChange={handleChange}
            placeholder="Enter Zoom link"
          />
        </div>
        <div>
          <Label htmlFor="category" value="Category" />
          <TextInput
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="e.g., Workshop, Meeting"
          />
        </div>
        <Button type="submit" color="blue" className="w-full">
          Add Event
        </Button>
      </form>
    </div>
  );
};

export default AddEventForm;