import React from 'react';

const ServiceCardSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="h-52 w-full bg-gray-200"></div>

      <div className="relative p-4 pt-11">
        <div className="absolute left-4 top-0 h-16 w-16 -translate-y-1/2 rounded-2xl border-4 border-white bg-gray-200"></div>

        <div className="mb-3 h-5 w-2/3 rounded-md bg-gray-200"></div>
        <div className="mb-2 h-4 w-1/2 rounded-md bg-gray-200"></div>
        <div className="h-4 w-1/3 rounded-md bg-gray-200"></div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center space-x-1">
                <div className="h-4 w-4 rounded-full bg-gray-200"></div>
                <div className="h-4 w-4 rounded-full bg-gray-200"></div>
                <div className="h-4 w-4 rounded-full bg-gray-200"></div>
                <div className="h-4 w-4 rounded-full bg-gray-200"></div>
                <div className="h-4 w-4 rounded-full bg-gray-200"></div>
            </div>
            <div className="h-6 w-1/4 rounded-md bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;
