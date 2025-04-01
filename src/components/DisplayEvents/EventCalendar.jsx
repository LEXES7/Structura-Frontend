import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get token from Redux store
  const { currentUser } = useSelector((state) => state.user || {});
  const token = currentUser?.token;

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await axios.get('/api/events/upcoming', { // Proxied URL
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched Events:', response.data); // Debug log
      setEvents(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Fetch Events Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch events';
      setError(errorMessage);
    }
  };

  // Generate calendar days for the current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    // Add empty slots for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if a day has an event
  const hasEvent = (day) => {
    return events.some((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{monthName}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-semibold text-gray-700">
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`p-2 h-20 border rounded-lg ${
              day
                ? hasEvent(day)
                  ? 'bg-blue-200 hover:bg-blue-300'
                  : 'bg-gray-100 hover:bg-gray-200'
                : 'bg-transparent'
            }`}
          >
            {day && (
              <>
                <span className="block text-sm">{day.getDate()}</span>
                {hasEvent(day) && (
                  <span className="text-xs text-blue-800">
                    {events
                      .filter((e) => new Date(e.startTime).getDate() === day.getDate())
                      .map((e) => e.title)
                      .join(', ')}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
          }
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
          }
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EventCalendar;