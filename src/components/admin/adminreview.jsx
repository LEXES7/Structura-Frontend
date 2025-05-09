import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaTrash, FaStar, FaCalendarAlt, FaUser, FaFilter } from 'react-icons/fa';

export default function AdminReview({ searchTerm = '' }) {
  const { currentUser } = useSelector((state) => state.user);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Fetch all reviews
  useEffect(() => {
    if (!currentUser?.isAdmin) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/reviews', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
        setReviews(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete || !currentUser?.isAdmin) return;
    
    try {
      // Make sure we're using the correct ID property (MongoDB uses _id)
      const reviewId = reviewToDelete._id || reviewToDelete.id;
      
      await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      
      // Update the state to remove the deleted review
      setReviews(prev => prev.filter(r => (r._id || r.id) !== reviewId));
      setDeleteSuccess(`Review from ${reviewToDelete.name} deleted successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err.response?.data?.message || 'Failed to delete review. Please try again.');
    }
    
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  // Get filtered and sorted reviews
  const getFilteredReviews = () => {
    return reviews
      .filter(review => {
        // Apply search filter
        if (localSearchTerm) {
          const searchLower = localSearchTerm.toLowerCase();
          return (
            review.name?.toLowerCase().includes(searchLower) ||
            review.description?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter(review => {
        // Apply rating filter
        if (filter === 'all') return true;
        if (filter === '5star') return review.rating === 5;
        if (filter === '4star') return review.rating === 4;
        if (filter === '3star') return review.rating === 3;
        if (filter === 'low') return review.rating < 3;
        return true;
      });
  };
  
  // Format date as "X days ago"
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const reviewDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return reviewDate.toLocaleDateString();
    }
  };

  const filteredReviews = getFilteredReviews();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Management</h2>
        <p className="text-gray-600">
          Manage customer reviews and testimonials
        </p>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {deleteSuccess && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          {deleteSuccess}
        </div>
      )}

      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <label className="sr-only">Search</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Search by name or content..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-600" />
            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5star">5 Stars</option>
              <option value="4star">4 Stars</option>
              <option value="3star">3 Stars</option>
              <option value="low">&lt; 3 Stars</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {filteredReviews.length} Reviews
        </span>
      </div>

      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((review) => (
            <div key={review._id || review.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <FaUser className="mr-2 text-gray-600" />
                    <h3 className="text-lg font-medium">{review.name}</h3>
                  </div>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <button
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  onClick={() => handleDeleteClick(review)}
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md mb-3">
                <p className="text-gray-700 italic">"{review.description}"</p>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <FaCalendarAlt className="mr-1" />
                <span>{formatDate(review.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews found matching your criteria.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <div className="text-center sm:text-left">
              <p className="mb-4">Are you sure you want to delete this review from <strong>{reviewToDelete?.name}</strong>?</p>
              <p className="text-gray-600 bg-gray-100 p-3 rounded italic mb-4">
                "{reviewToDelete?.description?.substring(0, 100)}{reviewToDelete?.description?.length > 100 ? '...' : ''}"
              </p>
              <p className="text-red-600 font-medium">This action cannot be undone.</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
                onClick={confirmDelete}
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}