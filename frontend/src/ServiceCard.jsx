import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaTag } from 'react-icons/fa';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useAuth } from './AuthProvider'; // Corrected to use the hook

const StarRating = ({ rating }) => {
    const totalStars = 5;
    const filledStars = Math.round(rating);
    return (
        <div className="flex items-center">
            {[...Array(totalStars)].map((_, index) => (
                <FaStar key={index} className={index < filledStars ? 'text-yellow-400' : 'text-gray-300'} />
            ))}
            <span className="ml-2 text-sm font-bold text-gray-600">{rating}</span>
        </div>
    );
};

function ServiceCard({ service }) {
  const navigate = useNavigate();
  const { tokens } = useAuth();
  const [liked, setLiked] = useState(service?.liked);
  const [likeCount, setLikeCount] = useState(service?.likes_count || 0);

  const toggleLike = (e) => {
    e.stopPropagation();
    if (!tokens) {
        navigate('/login');
        return;
    }
    fetch(`/api/vendors/services/${service.id}/like/`, {
      method: liked ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject('API request failed'))
      .then(data => {
        setLiked(data.liked);
        setLikeCount(data.likes);
      })
      .catch(console.error);
  };

  // Render nothing if the essential service data is missing
  if (!service || !service.vendor) {
    return null;
  }

  return (
    <div
      onClick={() => navigate(`/services/${service.id}`)}
      className="block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer"
    >
      <div className="relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <button
            onClick={toggleLike}
            className="absolute top-3 right-3 z-10 flex items-center bg-white/20 backdrop-blur-sm text-white rounded-full px-2 py-1 hover:bg-white/30 transition-colors"
        >
            {liked ? <AiFillHeart className="w-5 h-5 text-rose-500"/> : <AiOutlineHeart className="w-5 h-5"/>}
            <span className="ml-1 text-sm font-medium">{likeCount}</span>
        </button>
        <div
            onClick={(e) => {e.stopPropagation(); navigate(`/vendor/${service.vendor.username}`)}}
            className="absolute bottom-0 left-4 transform translate-y-1/2"
        >
            {/* SAFELY access nested properties */}
            <img
                src={service?.vendor?.profile_image || 'https://i.pravatar.cc/150'}
                alt={service?.vendor?.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg transition-transform hover:scale-110"
            />
        </div>
      </div>
      <div className="p-4 pt-10">
        <h4
            onClick={(e) => {e.stopPropagation(); navigate(`/vendor/${service.vendor.username}`)}}
            className="text-xl font-bold text-gray-800 truncate hover:text-pink-600"
        >
            {service?.vendor?.name}
        </h4>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <FaTag className="mr-2 text-pink-500" />
          <span>{service.category_name || 'General Services'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <FaMapMarkerAlt className="mr-2 text-pink-500" />
          <span>{service.location_tags || 'Not specified'}</span>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <StarRating rating={service.rating} />
            {service.price && (
                 <div className="text-right">
                    <p className="text-lg font-bold text-pink-600">R{service.price}</p>
                    <p className="text-xs text-gray-500">starting from</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;