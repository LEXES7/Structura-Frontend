import React, { useState, useEffect, Component } from 'react';
import { Button, Label, TextInput, Textarea, Table, Select, TableHead, TableHeadCell, TableBody, TableCell } from 'flowbite-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// Debugging: Log imports to verify they are defined
console.log('Flowbite Imports:', { Button, Label, TextInput, Textarea, Table, Select, TableHead, TableHeadCell, TableBody, TableCell });

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-500">
          <h2>Something went wrong!</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-blue-500 hover:bg-blue-600">
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AddEventForm = ({ selectedDate, eventData: initialEventData, onEventChange }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    zoomLink: '',
    category: '',
  });
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(initialEventData || null);

  const { currentUser } = useSelector((state) => state.user || {});
  const token = currentUser?.token;

  // Fetch events from the API
  const fetchEvents = async () => {
    if (!token) {
      setError('Please log in to view events');
      setEvents([
        { id: 1, title: 'Mock Event 1', startTime: '2025-05-10T10:00:00Z', category: 'Meeting' },
        { id: 2, title: 'Mock Event 2', startTime: '2025-05-11T14:00:00Z', category: 'Workshop' },
      ]);
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setEvents(Array.isArray(response.data) ? response.data : []);
      setIsLoading(false);
    } catch (err) {
      console.error('Fetch Events Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });
      setError(`Failed to fetch events: ${err.response?.data?.message || err.message}`);
      setEvents([
        { id: 1, title: 'Mock Event 1', startTime: '2025-05-10T10:00:00Z', category: 'Meeting' },
        { id: 2, title: 'Mock Event 2', startTime: '2025-05-11T14:00:00Z', category: 'Workshop' },
      ]);
      setIsLoading(false);
    }
  };

  // Initialize form with event data or selected date
  useEffect(() => {
    try {
      if (selectedEvent) {
        setFormData({
          title: selectedEvent.title || '',
          description: selectedEvent.description || '',
          startTime: selectedEvent.startTime ? new Date(selectedEvent.startTime).toISOString().slice(0, 16) : '',
          endTime: selectedEvent.endTime ? new Date(selectedEvent.endTime).toISOString().slice(0, 16) : '',
          zoomLink: selectedEvent.zoomLink || '',
          category: selectedEvent.category || '',
        });
      } else if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate)) {
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
    } catch (err) {
      console.error('Form Initialization Error:', err);
      setError('Error initializing form');
    }
  }, [selectedEvent, selectedDate]);

  // Fetch events on mount and when events change
  useEffect(() => {
    if (token) {
      fetchEvents();
    } else {
      setIsLoading(false);
    }
  }, [token, onEventChange]);

  // Filter events based on search and filter criteria
  const filteredEvents = events.filter(event => {
    try {
      const matchesSearch = event.title ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const matchesCategory = filterCategory ? event.category === filterCategory : true;
      const eventDate = event.startTime ? new Date(event.startTime) : null;
      const startDate = filterStartDate ? new Date(filterStartDate) : null;
      const endDate = filterEndDate ? new Date(filterEndDate) : null;
      const matchesDateRange =
        (!startDate || (eventDate && eventDate >= startDate)) &&
        (!endDate || (eventDate && eventDate <= new Date(endDate.setHours(23, 59, 59, 999))));
      return matchesSearch && matchesCategory && matchesDateRange;
    } catch (err) {
      console.error('Filter Error:', err);
      return false;
    }
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(events.map(event => event.category).filter(Boolean))];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!token) {
      setError('No authentication token found. Please log in.');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : '',
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : '',
      };
      let response;
      if (selectedEvent) {
        response = await axios.put(
          `/api/events/${selectedEvent._id || selectedEvent.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        setSuccess('Event updated successfully!');
        setEvents(events.map(e => (e._id || e.id) === (selectedEvent._id || selectedEvent.id) ? { ...e, ...payload } : e));
      } else {
        response = await axios.post(
          `/api/events`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        setSuccess('Event created successfully!');
        const newEvent = {
          _id: response.data._id || response.data.id || Date.now(),
          ...payload,
        };
        setEvents([newEvent, ...events]);
      }
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        zoomLink: '',
        category: '',
      });
      setSelectedEvent(null);
      if (onEventChange) onEventChange();
    } catch (err) {
      console.error('Axios Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save event';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !token) {
      setError('No event selected or not authenticated');
      return;
    }
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await axios.delete(`/api/events/${selectedEvent._id || selectedEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setSuccess('Event deleted successfully!');
      setEvents(events.filter(e => (e._id || e.id) !== (selectedEvent._id || selectedEvent.id)));
      setSelectedEvent(null);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        zoomLink: '',
        category: '',
      });
      if (onEventChange) onEventChange();
    } catch (err) {
      console.error('Delete Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete event';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      zoomLink: '',
      category: '',
    });
    setSelectedEvent(null);
    setError(null);
    setSuccess(null);
  };

  // Sanitize string for LaTeX
  const escapeLatex = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/\\/g, '\\textbackslash{}');
  };

  const generateReport = () => {
    console.log('Events for PDF:', filteredEvents);
    const latexContent = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{booktabs}
\\usepackage{longtable}
\\usepackage{hyperref}
\\usepackage{lmodern}
\\geometry{a4paper, margin=1in}
\\title{Events Report}
\\author{}
\\date{${new Date().toLocaleDateString()}}
\\begin{document}
\\maketitle
\\section*{Events Overview}
\\begin{longtable}{p{3cm}|p{4cm}|p{3cm}|p{3cm}|p{3cm}|p{2cm}}
\\toprule
\\textbf{Title} & \\textbf{Description} & \\textbf{Start Time} & \\textbf{End Time} & \\textbf{Zoom Link} & \\textbf{Category} \\\\
\\midrule
${filteredEvents
  .map(
    event => `
${escapeLatex(event.title || 'Untitled')} &
${escapeLatex(event.description || '-')} &
${escapeLatex(event.startTime ? new Date(event.startTime).toLocaleString() : '-')} &
${escapeLatex(event.endTime ? new Date(event.endTime).toLocaleString() : '-')} &
${escapeLatex(event.zoomLink || '-')} &
${escapeLatex(event.category || '-')} \\\\`
  )
  .join('')}
\\bottomrule
\\end{longtable}
\\end{document}
    `;

    const blob = new Blob([latexContent], { type: 'text/latex' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'events_report.tex');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <motion.div
        className="p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-gray-600">Loading events...</p>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div 
        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Events Overview</h2>
        <div className="mb-6">
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TextInput
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/3 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-1/3 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </Select>
            <div className="flex gap-2 w-full sm:w-1/3">
              <TextInput
                type="date"
                placeholder="Start Date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-1/2 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
              <TextInput
                type="date"
                placeholder="End Date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-1/2 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </motion.div>
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              onClick={generateReport}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Generate PDF Report
            </Button>
          </motion.div>
          {error && <p className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</p>}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <Table hoverable className="w-full">
              <TableHead>
                <TableHeadCell className="bg-blue-500 text-white">Title</TableHeadCell>
                <TableHeadCell className="bg-blue-500 text-white">Start Time</TableHeadCell>
                <TableHeadCell className="bg-blue-500 text-white">Category</TableHeadCell>
                <TableHeadCell className="bg-blue-500 text-white">Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event, index) => (
                    <motion.tr
                      key={event._id || event.id || index}
                      className={`${index % 2 === 0 ? 'bg-sky-50' : 'bg-amber-50'}`}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <TableCell className="font-medium text-gray-800">
                        {event.title || 'Untitled'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {event.startTime ? new Date(event.startTime).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {event.category || 'None'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="xs"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleEdit(event)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <TableCell colSpan="4" className="text-center text-gray-600">
                      No events found
                    </TableCell>
                  </motion.tr>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {selectedEvent ? 'Edit Event' : 'Add New Event'}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : selectedEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </motion.div>
            {selectedEvent && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={handleDelete}
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </ErrorBoundary>
  );
};

export default AddEventForm;