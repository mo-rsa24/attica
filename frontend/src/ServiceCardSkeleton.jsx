import React from 'react';

const ServiceCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      {/* Banner Image Skeleton */}
      <div className="w-full h-48 bg-gray-300"></div>

      <div className="relative p-4 pt-10">
        {/* Profile Image Skeleton */}
        <div className="absolute left-4 top-0 transform -translate-y-1/2 w-16 h-16 rounded-full bg-gray-300 border-4 border-white"></div>

        {/* Text Skeleton */}
        <div className="h-6 w-3/4 bg-gray-300 rounded-md mb-3"></div>
        <div className="h-4 w-1/2 bg-gray-300 rounded-md mb-2"></div>
        <div className="h-4 w-1/3 bg-gray-300 rounded-md"></div>

        {/* Rating and Price Skeleton */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-1">
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
            </div>
            <div className="h-6 w-1/4 bg-gray-300 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;