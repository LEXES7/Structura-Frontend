import React, { useState, useEffect } from 'react';
import { Button, Label, TextInput, Textarea } from 'flowbite-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AddEventForm = ({ selectedDate, eventData, onClose, onEventChange }) => {
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

  // Initialize form with event data (for editing) or selected date (for new events)
  useEffect(() => {
    if (eventData) {
      // Editing an existing event
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        startTime: eventData.startTime ? eventData.startTime.slice(0, 16) : '',
        endTime: eventData.endTime ? eventData.endTime.slice(0, 16) : '',
        zoomLink: eventData.zoomLink || '',
        category: eventData.category || '',
      });
    } else if (selectedDate) {
      // New event with selected date
      const dateStr = selectedDate.toISOString().slice(0, 10);
      setFormData({
        title: '',
        description: '',
        startTime: `${dateStr}T09:00`, // Default to 9 AM
        endTime: '',
        zoomLink: '',
        category: '',
      });
    } else {
      // No selected date (e.g., from button)
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        zoomLink: '',
        category: '',
      });
    }
  }, [eventData, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Format datetime-local value to ISO 8601 (e.g., "2025-04-03T02:15:00")
    const formattedValue = name === 'startTime' || name === 'endTime' 
      ? value + ':00'
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
      let response;
      if (eventData) {
        // Update existing event
        response = await axios.put(
          `/api/events/${eventData.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        setSuccess('Event updated successfully!');
      } else {
        // Create new event
        response = await axios.post(
          `/api/events`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        setSuccess('Event created successfully!');
      }
      console.log('Response Data:', response.data);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        zoomLink: '',
        category: ''
      });
      onEventChange(); // Notify parent to refresh events
      onClose(); // Close the modal
    } catch (err) {
      console.error('Axios Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      const errorMessage =
        err.response?.data?.message || err.message || 'Network Error';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!eventData || !token) return;

    try {
      await axios.delete(`/api/events/${eventData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Event deleted successfully!');
      onEventChange(); // Notify parent to refresh events
      onClose(); // Close the modal
    } catch (err) {
      console.error('Delete Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to delete event';
      setError(errorMessage);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {eventData ? 'Edit Event' : 'Add New Event'}
      </h2>
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
        <div className="flex space-x-2">
          <Button type="submit" color="blue" className="w-full">
            {eventData ? 'Update Event' : 'Add Event'}
          </Button>
          {eventData && (
            <Button
              type="button"
              color="red"
              className="w-full"
              onClick={handleDelete}
            >
              Delete Event
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddEventForm;