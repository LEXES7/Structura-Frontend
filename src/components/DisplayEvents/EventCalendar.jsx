import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Label, TextInput, Textarea, Dropdown } from 'flowbite-react';
import axios from 'axios';

const AddEventForm = ({ selectedDate, eventData, onEventChange }) => {
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

  useEffect(() => {
    if (eventData) {
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        startTime: eventData.startTime ? eventData.startTime.slice(0, 16) : '',
        endTime: eventData.endTime ? eventData.endTime.slice(0, 16) : '',
        zoomLink: eventData.zoomLink || '',
        category: eventData.category || '',
      });
    } else if (selectedDate) {
      const dateStr = selectedDate.toISOString().slice(0, 10);
      setFormData({
        title: '',
        description: '',
        startTime: `${dateStr}T09:00`,
        endTime: '',
        zoomLink: '',
        category: '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        zoomLink: '',
        category: '',
      });
    }
    console.log('Form Data Initialized:', { formData, eventData, selectedDate });
  }, [eventData, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === 'startTime' || name === 'endTime' 
      ? value + ':00'
      : value;
    setFormData({ ...formData, [name]: formattedValue });
    console.log('Form Input Changed:', { name, value, formattedValue });
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
      onEventChange();
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
      onEventChange();
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

  const handleClearForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      zoomLink: '',
      category: ''
    });
    setError(null);
    setSuccess(null);
    console.log('Form Cleared');
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
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
          <Button
            type="button"
            color="gray"
            className="w-full"
            onClick={handleClearForm}
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
};

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  const { currentUser } = useSelector((state) => state.user || {});
  const token = currentUser?.token;

  useEffect(() => {
    fetchUpcomingEvents();
  }, [currentMonth, token]);

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns = {};
      events.forEach(event => {
        if (event.startTime) {
          const now = new Date();
          const eventDate = new Date(event.startTime);
          const diffMs = eventDate - now;
          if (diffMs > 0) {
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            newCountdowns[event.startTime] = `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
          } else {
            newCountdowns[event.startTime] = 'Event has started';
          }
        }
      });
      setCountdowns(newCountdowns);
    };
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [events]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const endpoint = '/api/events/upcoming';
      console.log('Fetching events from:', endpoint);
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched Events:', data);
      const eventArray = Array.isArray(data) ? data : [];
      setEvents(eventArray);
      console.log('Set Events:', eventArray);
      setError(null);
    } catch (err) {
      console.error('Fetch Events Error:', err);
      const errorMessage = err.message || 'Failed to fetch events';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const hasEvent = (day) => {
    if (!day) return false;
    return getEventsForDay(day).length > 0;
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dayEvents = getEventsForDay(day);
    setSelectedDate(day);
    setSelectedEvent(dayEvents.length > 0 ? dayEvents[0] : null);
    console.log('Date Click:', { day, dayEvents, selectedEvent });
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const getNearEvents = () => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nearEvents = events
      .filter(event => {
        if (!event.startTime) return false;
        const eventDate = new Date(event.startTime);
        return eventDate >= now && eventDate <= oneWeekFromNow && !isNaN(eventDate);
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    console.log('Near Events:', nearEvents);
    return nearEvents;
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          getNearEvents().forEach(event => {
            new Notification(`Upcoming Event: ${event.title}`, {
              body: `Starts on ${new Date(event.startTime).toLocaleString()}`,
              tag: 'event-reminder'
            });
          });
        }
      });
    }
  };

  const generateReport = () => {
    const headers = ['Title', 'Description', 'Start Time', 'End Time', 'Zoom Link', 'Category'];
    const csvContent = [
      headers.join(','),
      ...events.map(event => 
        [
          `"${event.title || 'Untitled'}"`,
          `"${event.description || ''}"`,
          `"${event.startTime ? new Date(event.startTime).toLocaleString() : '-'}"`,
          `"${event.endTime ? new Date(event.endTime).toLocaleString() : '-'}"`,
          `"${event.zoomLink || ''}"`,
          `"${event.category || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'events_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Notification Dropdown */}
      {currentUser && (
        <div className="mb-6 flex justify-end">
          <Dropdown label="Upcoming Events (Next 7 Days)" inline>
            <Dropdown.Header>
              <span className="block text-sm font-semibold">Events within 7 Days</span>
            </Dropdown.Header>
            {getNearEvents().length > 0 ? (
              getNearEvents().map((event, index) => (
                <Dropdown.Item key={index} onClick={() => setSelectedEvent(event)}>
                  <div className="flex flex-col">
                    <strong className="text-gray-800">{event.title || 'Untitled'}</strong>
                    <span className="text-sm text-gray-600">
                      Start: {event.startTime ? new Date(event.startTime).toLocaleString() : '-'}
                    </span>
                  </div>
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item>No upcoming events within 7 days.</Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={requestNotificationPermission}>
              Enable Notifications
            </Dropdown.Item>
          </Dropdown>
        </div>
      )}

      {/* Calendar Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading calendar...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`p-2 h-20 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    !day
                      ? 'bg-transparent'
                      : isToday(day)
                      ? 'bg-yellow-100 hover:bg-yellow-200'
                      : hasEvent(day)
                      ? 'bg-blue-100 hover:bg-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {day && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-700' : ''}`}>
                          {day.getDate()}
                        </span>
                        {hasEvent(day) && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="mt-1 overflow-hidden max-h-12">
                        {getEventsForDay(day).slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            className="text-xs truncate text-blue-800 bg-blue-50 px-1 py-0.5 mb-0.5 rounded"
                          >
                            {formatEventTime(event.startTime)} {event.title}
                          </div>
                        ))}
                        {getEventsForDay(day).length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{getEventsForDay(day).length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={goToPreviousMonth}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Form Section */}
      <div className="mt-8">
        {currentUser ? (
          <AddEventForm
            selectedDate={selectedDate}
            eventData={selectedEvent}
            onEventChange={fetchUpcomingEvents}
          />
        ) : (
          <p className="text-gray-600 text-center">
            Please log in to add or edit events.
          </p>
        )}
      </div>

      {/* All Events Section */}
      {currentUser && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Schedule</h2>
            <Button color="blue" onClick={generateReport}>
              Generate Report
            </Button>
          </div>
          <div className="mb-4">
            <TextInput
              type="text"
              placeholder="Search events by title..."
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                setEvents(events.filter(event => 
                  event.title?.toLowerCase().includes(searchTerm)
                ));
                if (searchTerm === '') fetchUpcomingEvents();
              }}
              className="w-full max-w-md"
            />
          </div>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event, index) => (
                <div key={index} className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800">{event.title || 'Untitled'}</h3>
                  <p className="text-gray-600">{event.startTime ? new Date(event.startTime).toLocaleString() : '-'}</p>
                  <p className="text-gray-500 mt-1">Countdown: {countdowns[event.startTime] || 'Calculating...'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No events available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCalendar;