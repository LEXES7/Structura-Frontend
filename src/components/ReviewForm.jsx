import React, { useState } from 'react';
import { Button, Label, TextInput, Textarea } from 'flowbite-react';
import axios from 'axios';
import { HiStar } from 'react-icons/hi';

export default function ReviewForm({ onReviewAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    rating: 0,
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }
    
    if (formData.rating === 0) {
      setError('Please select a rating');
      setLoading(false);
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Please enter a review description');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Submitting review:', formData);
      const response = await axios.post('http://localhost:8080/api/reviews', {
        name: formData.name,
        rating: parseInt(formData.rating),
        description: formData.description
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Review submission successful:', response.data);
      
      // Reset form
      setFormData({
        name: '',
        rating: 0,
        description: ''
      });
      
      setSuccess(true);
      
      // Notify parent component
      if (onReviewAdded) {
        onReviewAdded(response.data);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      if (err.response) {
        setError(`Failed to submit review: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        setError('Failed to submit review: No response from server. Check if the backend is running.');
      } else {
        setError('Failed to submit review: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Leave a Review</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md">
          Thank you for your review! It has been submitted successfully.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" value="Your Name" />
          <TextInput
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
        
        <div>
          <Label value="Your Rating" />
          <div className="mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="text-2xl focus:outline-none"
                  onClick={() => handleRatingChange(i + 1)}
                >
                  <HiStar 
                    className={i < formData.rating 
                      ? "text-yellow-400" 
                      : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="description" value="Your Review" />
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Share your thoughts and experience..."
            required
            rows={4}
          />
        </div>
        
        <Button 
          type="submit" 
          color="blue"
          className="w-full mt-4 py-2"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
              Submitting...
            </div>
          ) : (
            <span className="flex items-center justify-center">
              <HiStar className="mr-2" />
              Submit Review
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}