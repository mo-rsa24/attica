import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaCalendarAlt } from 'react-icons/fa';

const Card = ({ item, type }) => {
  const renderCardContent = () => {
    switch (type) {
      case 'artist':
        return (
          <>
            <img src={item.profile_image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <FaStar className="mr-1 text-yellow-500" />
                <span>{item.rating}</span>
                <span className="mx-2">|</span>
                <span>{item.genres}</span>
              </div>
            </div>
          </>
        );
      case 'location':
        return (
          <>
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.venue_count} venues/services</p>
            </div>
          </>
        );
      case 'event':
        return (
          <>
            <img src={item.banner_image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <FaCalendarAlt className="mr-2" />
                <span>{new Date(item.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <span>{item.location.name}</span>
              </div>
            </div>
          </>
        );
      default:
        // Default to service card
        return (
          <>
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.vendor.name}</p>
              <div className="flex items-center text-sm text-gray-600">
                <FaStar className="mr-1 text-yellow-500" />
                <span>{item.rating}</span>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <Link to={`/${type}s/${item.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
      {renderCardContent()}
    </Link>
  );
};

export default Card;