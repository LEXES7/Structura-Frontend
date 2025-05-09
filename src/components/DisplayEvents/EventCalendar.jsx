import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Label, TextInput, Table } from 'flowbite-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const EventCalendar = ({ isAdminView = false }) => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [viewMode, setViewMode] = useState('card'); // New state for view mode
  const [searchTerm, setSearchTerm] = useState('');

  const { currentUser } = useSelector((state) => state.user || {});
  const token = currentUser?.token;

  useEffect(() => {
    fetchUpcomingEvents();
  }, [currentMonth]);

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
      // Use direct URL with the appropriate endpoint to avoid redirects
      const response = await axios.get('http://localhost:8080/api/events/upcoming');
      const eventArray = Array.isArray(response.data) ? response.data : [];
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
      {/* Notification Button */}
      {currentUser && (
        <motion.div 
          className="mb-6 flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Button onClick={requestNotificationPermission} className="bg-blue-500 hover:bg-blue-600">
            Enable Notifications
          </Button>
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

      {/* All Events Section */}
      {currentUser && (
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
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
                setSearchTerm(searchTerm);
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
                    <p className="text-gray-600 mt-2">{event.description ? event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '') : 'No description available'}</p>
                    <p className="text-gray-600 mt-2">{event.startTime ? new Date(event.startTime).toLocaleString() : '-'}</p>
                    <p className="text-gray-500 mt-1">Countdown: {countdowns[event.startTime] || 'Calculating...'}</p>
                    {event.zoomLink && (
                      <div className="mt-3">
                        <a 
                          href={event.zoomLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
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