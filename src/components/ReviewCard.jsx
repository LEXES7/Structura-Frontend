import React from 'react';
import { HiStar } from 'react-icons/hi';
import { formatDistance } from 'date-fns';

export default function ReviewCard({ review }) {
  // Get initial letter for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Get random pastel background color based on name
  const getAvatarColor = (name) => {
    if (!name) return 'bg-blue-200';
    
    const colors = [
      'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 
      'bg-red-200', 'bg-purple-200', 'bg-pink-200', 
      'bg-indigo-200', 'bg-teal-200'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format date as "X days ago"
  const formatDate = (dateString) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (err) {
      return 'some time ago';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-102 hover:shadow-lg">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 ${getAvatarColor(review.name)}`}>
          {getInitial(review.name)}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-800">{review.name}</h3>
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <HiStar
                  key={i}
                  className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 mt-3 leading-relaxed">
        "{review.description}"
      </p>
    </div>
  );
}