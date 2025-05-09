import React, { useState, useEffect, Component } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Label, TextInput, Textarea, Select } from 'flowbite-react';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg bg-red-50 text-red-800">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="mb-2">{this.state.error?.message || 'An unknown error occurred'}</p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AddEventForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const eventId = searchParams.get('id');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    category: 'Workshop',
    zoomLink: '',
    googleMeetLink: '',
    eventImageUrl: '',
    isOnline: true,
    status: 'scheduled',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/signin');
    }
    
    fetchEvents();
    
    if (eventId) {
      fetchEventDetails(eventId);
      setIsEdit(true);
    }
  }, [currentUser, navigate, eventId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Use authentication token for better security
      const headers = currentUser?.token ? {
        'Authorization': `Bearer ${currentUser.token}`
      } : {};
      
      const response = await axios.get('http://localhost:8080/api/events/upcoming', { headers });
      setEvents(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      
      if (response.data) {
        const eventData = response.data;
        
        // Format dates for input fields
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
        };
        
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          startTime: formatDateForInput(eventData.startTime),
          endTime: formatDateForInput(eventData.endTime),
          location: eventData.location || '',
          category: eventData.category || 'Workshop',
          zoomLink: eventData.zoomLink || '',
          googleMeetLink: eventData.googleMeetLink || '',
          eventImageUrl: eventData.eventImageUrl || '',
          isOnline: eventData.isOnline !== false, // Default to true if not specified
          status: eventData.status || 'scheduled',
          notes: eventData.notes || ''
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to fetch event details. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.title.trim()) {
      errors.push('Event title is required');
    }
    if (!formData.startTime) {
      errors.push('Start time is required');
    }
    if (!formData.endTime) {
      errors.push('End time is required');
    }
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      errors.push('End time must be after start time');
    }
    if (!formData.category) {
      errors.push('Category is required');
    }
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = currentUser?.token;
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        ...formData
      };

      let response;
      if (isEdit && eventId) {
        response = await axios.put(`http://localhost:8080/api/events/${eventId}`, payload, { headers });
        setSuccess('Event updated successfully');
      } else {
        response = await axios.post('http://localhost:8080/api/events', payload, { headers });
        setSuccess('Event created successfully');
      }
      
      console.log('Event saved:', response.data);
      fetchEvents(); // Refresh event list
      
      if (!isEdit) {
        // Reset form after creating a new event
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          location: '',
          category: 'Workshop',
          zoomLink: '',
          googleMeetLink: '',
          eventImageUrl: '',
          isOnline: true,
          status: 'scheduled',
          notes: ''
        });
      }
    } catch (err) {
      console.error('Axios Error:', err);
      setError(`An error occurred: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setLoading(true);
      const token = currentUser?.token;
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      await axios.delete(`http://localhost:8080/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess('Event deleted successfully');
      fetchEvents();
      
      // If we're editing the event that was just deleted, reset form and go back to create mode
      if (isEdit && id === eventId) {
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          location: '',
          category: 'Workshop',
          zoomLink: '',
          googleMeetLink: '',
          eventImageUrl: '',
          isOnline: true,
          status: 'scheduled',
          notes: ''
        });
        setIsEdit(false);
        navigate('/admin-dashboard?tab=addevent');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(`Failed to delete event: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  };

  return (
    <ErrorBoundary>
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Event' : 'Add New Event'}</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}
        
        <div className="mb-6">
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="title" value="Event Title *" />
              <TextInput
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter event title"
                className="mt-1"
              />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="category" value="Category *" />
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1"
              >
                <option value="Workshop">Workshop</option>
                <option value="Webinar">Webinar</option>
                <option value="Conference">Conference</option>
                <option value="Meetup">Meetup</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="startTime" value="Start Time *" />
              <TextInput
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="endTime" value="End Time *" />
              <TextInput
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="description" value="Description" />
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide event details"
              className="mt-1"
            />
          </div>
          
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="location" value="Location" />
              <TextInput
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event location"
                className="mt-1"
              />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <div className="flex items-center h-full pt-6">
                <input
                  id="isOnline"
                  name="isOnline"
                  type="checkbox"
                  checked={formData.isOnline}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="isOnline" value="Online Event" className="ml-2" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="zoomLink" value="Zoom Link" />
              <TextInput
                id="zoomLink"
                name="zoomLink"
                value={formData.zoomLink}
                onChange={handleChange}
                placeholder="https://zoom.us/j/..."
                className="mt-1"
              />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="googleMeetLink" value="Google Meet Link" />
              <TextInput
                id="googleMeetLink"
                name="googleMeetLink"
                value={formData.googleMeetLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="eventImageUrl" value="Event Image URL" />
            <TextInput
              id="eventImageUrl"
              name="eventImageUrl"
              value={formData.eventImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
          </div>
          
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="status" value="Status" />
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1"
              >
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <Label htmlFor="notes" value="Admin Notes" />
              <TextInput
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Internal notes (not shown to users)"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            color="light"
            onClick={() => navigate('/admin-dashboard?tab=events')}
          >
            Cancel
          </Button>
          
          <Button
            color="success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                {isEdit ? 'Updating...' : 'Creating...'}
              </div>
            ) : isEdit ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">All Events</h3>
          
          {loading && !events.length ? (
            <div className="text-center p-8">
              <div className="animate-spin h-8 w-8 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full"></div>
              <p className="mt-2">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Replace Table with a standard HTML table */}
              <table className="w-full text-sm text-left text-gray-500 border-collapse">
                <thead className="text-xs text-white uppercase bg-blue-500">
                  <tr>
                    <th scope="col" className="py-3 px-6">Title</th>
                    <th scope="col" className="py-3 px-6">Start Time</th>
                    <th scope="col" className="py-3 px-6">Category</th>
                    <th scope="col" className="py-3 px-6">Status</th>
                    <th scope="col" className="py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id || event._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {event.title}
                      </td>
                      <td className="py-4 px-6">{formatDate(event.startTime)}</td>
                      <td className="py-4 px-6">{event.category || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          event.status === 'postponed' ? 'bg-yellow-100 text-yellow-800' :
                          event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {event.status || 'scheduled'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button 
                            size="xs" 
                            onClick={() => navigate(`/addevent?id=${event.id || event._id}`)}
                            color="info"
                          >
                            Edit
                          </Button>
                          <Button 
                            size="xs" 
                            color="failure"
                            onClick={() => handleDelete(event.id || event._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No events found. Create your first event above.
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AddEventForm;