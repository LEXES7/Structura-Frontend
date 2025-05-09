import React, { useState, useEffect } from 'react';
import { HiTrash, HiSearch, HiStar, HiX } from 'react-icons/hi';
import { Button, TextInput, Modal, Spinner, Alert } from 'flowbite-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { formatDistance } from 'date-fns';

export default function AdminReview({ searchTerm = '' }) {
  const { currentUser } = useSelector((state) => state.user);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'highest', 'lowest'
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Fetch all reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser?.isAdmin) return;
      
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8080/api/reviews', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
        setReviews(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.response?.data?.message || 'Failed to fetch reviews. Please try again.');
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
      await axios.delete(`http://localhost:8080/api/reviews/${reviewToDelete._id || reviewToDelete.id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      
      setReviews(prev => prev.filter(r => (r._id || r.id) !== (reviewToDelete._id || reviewToDelete.id)));
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
    // First filter by search term if any
    let filtered = reviews;
    
    if (localSearchTerm.trim()) {
      const term = localSearchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.name.toLowerCase().includes(term) || 
        review.description.toLowerCase().includes(term)
      );
    }
    
    // Then apply sorting based on filter
    switch (filter) {
      case 'highest':
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return [...filtered].sort((a, b) => a.rating - b.rating);
      case 'newest':
        return [...filtered].sort((a, b) => 
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      case 'oldest':
        return [...filtered].sort((a, b) => 
          new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
      default: // 'all'
        return filtered;
    }
  };
  
  // Format date as "X days ago"
  const formatDate = (dateString) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (err) {
      return 'some time ago';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="xl" />
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();
  
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-semibold">
          Review Management 
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredReviews.length} reviews)
          </span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <TextInput
            icon={HiSearch}
            placeholder="Search reviews..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}
      
      {deleteSuccess && (
        <Alert color="success" className="mb-4">
          {deleteSuccess}
        </Alert>
      )}
      
      {/* Reviews Table */}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3">Reviewer</th>
                <th scope="col" className="px-6 py-3">Rating</th>
                <th scope="col" className="px-6 py-3">Review</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr 
                    key={review._id || review.id} 
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {review.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <HiStar
                              key={i}
                              className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="ml-2">{review.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs lg:max-w-md truncate">
                        {review.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(review.createdAt || review.date)}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        size="xs" 
                        color="failure"
                        onClick={() => handleDeleteClick(review)}
                      >
                        <HiTrash className="mr-2" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {localSearchTerm 
                      ? "No reviews match your search criteria" 
                      : "No reviews found in the database"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal show={showDeleteModal} onClose={cancelDelete}>
          <Modal.Header>
            Confirm Delete Review
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p>Are you sure you want to delete this review from <b>{reviewToDelete?.name}</b>?</p>
              
              {reviewToDelete && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <HiStar
                          key={i}
                          className={i < reviewToDelete.rating ? "text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(reviewToDelete.createdAt || reviewToDelete.date)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    "{reviewToDelete.description}"
                  </p>
                </div>
              )}
              
              <p className="text-red-600 dark:text-red-400">
                This action cannot be undone!
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="failure" onClick={confirmDelete}>
              Yes, Delete Review
            </Button>
            <Button color="gray" onClick={cancelDelete}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}