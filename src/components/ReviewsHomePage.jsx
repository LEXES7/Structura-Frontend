import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'flowbite-react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { HiStar, HiClock, HiPlus } from 'react-icons/hi';

export default function ReviewsHomePage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('recent'); // 'recent' or 'top-rated'
  const [showAddReview, setShowAddReview] = useState(false);
  
  const fetchReviews = async (filterType = 'recent') => {
    try {
      setLoading(true);
      
      // Use absolute API endpoint
      const endpoint = filterType === 'top-rated' 
        ? 'http://localhost:8080/api/reviews/top-rated' 
        : 'http://localhost:8080/api/reviews/recent';
      console.log(`Fetching reviews from ${endpoint}`);
      
      const response = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Reviews received:', response.data);
      setReviews(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      if (err.response) {
        setError(`Failed to load reviews: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        setError('Failed to load reviews: No response from server. Check if the backend is running.');
      } else {
        setError('Failed to load reviews: ' + err.message);
      }
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews(filter);
  }, [filter]);
  
  const handleReviewAdded = (newReview) => {
    if (filter === 'recent') {
      // Add to the beginning if sorted by recent
      setReviews([newReview, ...reviews]);
    } else {
      // Otherwise, refetch to maintain proper sorting
      fetchReviews(filter);
    }
    
    // Auto-hide the form after submitting
    setShowAddReview(false);
    
    // Scroll to top and show a success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center relative">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Customer Reviews
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            See what others are saying about our service. Share your experience with us!
          </p>
          
          {/* Add Review Button */}
          <Button
            color="blue"
            size="xl"
            className="mx-auto px-8 py-3"
            onClick={() => setShowAddReview(!showAddReview)}
          >
            {showAddReview ? 'Hide Form' : 'Add Your Review'} 
            {!showAddReview && <HiPlus className="ml-2" />}
          </Button>
        </div>
        
        {/* Review Form - Shown only when Add Review button is clicked */}
        {showAddReview && (
          <div className="max-w-xl mx-auto mb-12">
            <ReviewForm onReviewAdded={handleReviewAdded} />
          </div>
        )}
        
        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-gray-800">{reviews.length}</div>
            <div className="text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600">{averageRating}</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center flex items-center px-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <HiStar 
                  key={i}
                  className={i < Math.round(parseFloat(averageRating)) 
                    ? "text-yellow-400 text-2xl" 
                    : "text-gray-300 text-2xl"}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Reviews List */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Customer Feedback</h2>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color={filter === 'recent' ? 'blue' : 'light'}
                  onClick={() => setFilter('recent')}
                >
                  <HiClock className="mr-1" /> Recent
                </Button>
                <Button
                  size="sm"
                  color={filter === 'top-rated' ? 'blue' : 'light'}
                  onClick={() => setFilter('top-rated')}
                >
                  <HiStar className="mr-1" /> Top Rated
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Spinner size="xl" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
                {error}
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-gray-50 text-gray-500 p-8 rounded-md text-center">
                <p className="text-lg mb-4">No reviews yet!</p>
                <p className="mb-4">Be the first to share your experience.</p>
                {!showAddReview && (
                  <Button
                    color="blue"
                    onClick={() => setShowAddReview(true)}
                  >
                    <HiPlus className="mr-1" /> Add First Review
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <ReviewCard key={review.id || review._id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Fixed Add Review button */}
        {!showAddReview && (
          <div className="fixed bottom-8 right-8 z-50">
            <Button
              color="blue"
              pill
              className="shadow-lg"
              onClick={() => {
                setShowAddReview(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <HiPlus className="mr-1" /> Add Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}