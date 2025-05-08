import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Label, TextInput, Textarea, Dropdown, Table } from 'flowbite-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
  }, [eventData, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
  };

  return (
    <motion.div 
      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
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
            className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
            className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
            className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
            className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
            className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
            className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              {eventData ? 'Update Event' : 'Add Event'}
            </Button>
          </motion.div>
          {eventData && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete Event
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              className="w-full bg-gray-500 hover:bg-gray-600"
              onClick={handleClearForm}
            >
              Clear Form
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [viewMode, setViewMode] = useState('card'); // New state for view mode

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
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const eventArray = Array.isArray(data) ? data : [];
      setEvents(eventArray);
      setAllEvents(eventArray);
      setError(null);
    } catch (err) {
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
    const now = Date.now();
    const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;
    return events
      .filter(event => {
        if (!event.startTime) return false;
        const eventDate = new Date(event.startTime).getTime();
        return eventDate >= now && eventDate <= oneWeekFromNow && !isNaN(eventDate);
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
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
    <motion.div 
      className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Notification Dropdown */}
      {currentUser && (
        <motion.div 
          className="mb-6 flex justify-end"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Dropdown 
            label="Upcoming Events" 
            inline
            className="bg-white rounded-lg shadow-md"
          >
            <Dropdown.Header>
              <span className="block text-sm font-semibold text-gray-800">Events within 7 Days</span>
            </Dropdown.Header>
            <AnimatePresence>
              {getNearEvents().length > 0 ? (
                getNearEvents().map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Dropdown.Item onClick={() => setSelectedEvent(event)}>
                      <div className="flex flex-col">
                        <strong className="text-gray-800">{event.title || 'Untitled'}</strong>
                        <span className="text-sm text-gray-600">
                          {event.startTime 
                            ? new Date(event.startTime).toLocaleDateString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}
                        </span>
                      </div>
                    </Dropdown.Item>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Dropdown.Item>No upcoming events.</Dropdown.Item>
                </motion.div>
              )}
            </AnimatePresence>
            <Dropdown.Divider />
            <Dropdown.Item onClick={requestNotificationPermission}>
              Enable Notifications
            </Dropdown.Item>
          </Dropdown>
        </motion.div>
      )}

      {/* Calendar Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-8">
            <motion.div 
              className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
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
                <motion.div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`p-2 h-20 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    !day
                      ? 'bg-transparent'
                      : isToday(day)
                      ? 'bg-coral-100 hover:bg-coral-200'
                      : hasEvent(day)
                      ? 'bg-blue-100 hover:bg-blue-200'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {day && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-700' : 'text-gray-800'}`}>
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
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <motion.button
                onClick={goToPreviousMonth}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Previous
              </motion.button>
              <motion.button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 text-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Today
              </motion.button>
              <motion.button
                onClick={goToNextMonth}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Next
              </motion.button>
            </div>
          </>
        )}
      </motion.div>

      {/* Form Section */}
      <div className="mt-8">
        {currentUser ? (
          <AddEventForm
            selectedDate={selectedDate}
            eventData={selectedEvent}
            onEventChange={fetchUpcomingEvents}
          />
        ) : (
          <motion.p 
            className="text-gray-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Please log in to add or edit events.
          </motion.p>
        )}
      </div>

      {/* All Events Section */}
      {currentUser && (
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Schedule</h2>
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className={`bg-blue-500 hover:bg-blue-600 ${viewMode === 'card' ? 'opacity-100' : 'opacity-50'}`}
                  onClick={() => setViewMode('card')}
                >
                  Card View
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className={`bg-blue-500 hover:bg-blue-600 ${viewMode === 'table' ? 'opacity-100' : 'opacity-50'}`}
                  onClick={() => setViewMode('table')}
                >
                  Table View
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={generateReport}>
                  Generate Report
                </Button>
              </motion.div>
            </div>
          </div>
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TextInput
              type="text"
              placeholder="Search events by title..."
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm === '') {
                  setEvents(allEvents);
                } else {
                  setEvents(allEvents.filter(event => 
                    event.title?.toLowerCase().includes(searchTerm)
                  ));
                }
              }}
              className="w-full max-w-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </motion.div>
          {events.length > 0 ? (
            viewMode === 'card' ? (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {events.map((event, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                      index % 2 === 0 ? 'bg-sky-50' : 'bg-amber-50'
                    }`}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{event.title || 'Untitled'}</h3>
                    <p className="text-gray-600">{event.startTime ? new Date(event.startTime).toLocaleString() : '-'}</p>
                    <p className="text-gray-500 mt-1">Countdown: {countdowns[event.startTime] || 'Calculating...'}</p>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <div className="overflow-x-auto">
                  <Table hoverable className="w-full">
                    <Table.Head>
                      <Table.HeadCell className="bg-blue-500 text-white">Title</Table.HeadCell>
                      <Table.HeadCell className="bg-blue-500 text-white">Start Time</Table.HeadCell>
                      <Table.HeadCell className="bg-blue-500 text-white">End Time</Table.HeadCell>
                      <Table.HeadCell className="bg-blue-500 text-white">Category</Table.HeadCell>
                      <Table.HeadCell className="bg-blue-500 text-white">Zoom Link</Table.HeadCell>
                      <Table.HeadCell className="bg-blue-500 text-white">Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {events.map((event, index) => (
                        <motion.tr
                          key={index}
                          className={`${index % 2 === 0 ? 'bg-sky-50' : 'bg-amber-50'}`}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Table.Cell className="font-medium text-gray-800">
                            {event.title || 'Untitled'}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600">
                            {event.startTime ? new Date(event.startTime).toLocaleString() : '-'}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600">
                            {event.endTime ? new Date(event.endTime).toLocaleString() : '-'}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600">
                            {event.category || '-'}
                          </Table.Cell>
                          <Table.Cell>
                            {event.zoomLink ? (
                              <a
                                href={event.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Join
                              </a>
                            ) : '-'}
                          </Table.Cell>
                          <Table.Cell>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="xs"
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={() => setSelectedEvent(event)}
                              >
                                Edit
                              </Button>
                            </motion.div>
                          </Table.Cell>
                        </motion.tr>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </motion.div>
            )
          ) : (
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No events available.
            </motion.p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EventCalendar;