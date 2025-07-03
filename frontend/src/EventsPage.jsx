import React from 'react';
import {Link} from "react-router-dom";

// Individual step component
const InfoStep = ({ number, title, description, imageUrl }) => (
  <div className="flex items-center space-x-12">
    <div className="flex-shrink-0">
      <span className="text-4xl font-semibold text-gray-800">{number}</span>
    </div>
    <div className="flex-grow">
      <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-lg text-gray-600">{description}</p>
    </div>
    <div className="flex-shrink-0">
      <img src={imageUrl} alt={title} className="h-32 w-auto object-contain" />
    </div>
  </div>
);

// Main component for the page
export default function EventsPage() {
  const steps = [
    {
      number: 1,
      title: 'Tell us about your event',
      description: 'Share some basic info, like where it is and how many people will be attending your event.',
      imageUrl: 'https://placehold.co/150x100/FFF0F5/DB2777?text=Bedroom',
    },
    {
      number: 2,
      title: 'Make it stand out',
      description: 'Add 5 or more photos plus a title and description—we’ll help you out.',
      imageUrl: 'https://placehold.co/150x100/FFFBEB/F59E0B?text=Living+Room',
    },
    {
      number: 3,
      title: 'Finish up and publish',
      description: 'Choose a starting price, verify a few details, then publish your listing.',
      imageUrl: 'https://placehold.co/150x100/F0FFF4/10B981?text=Front+Door',
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <svg
            viewBox="0 0 1000 1000"
            role="presentation"
            aria-hidden="true"
            focusable="false"
            className="h-8 w-8 text-pink-600"
            style={{ display: 'block', fill: 'currentColor' }}
          >
            <path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-21 41-32 72-32 31 0 54 11 72 32 17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43.2c-11-12.9-25-23.9-40-31.9-50-23.9-92-42.9-123-58.9-32-16-56-28.9-73-38.9-17-9-29-15-37-19-21-10.9-35-18.9-44-24.9-7-5-13-9-20-13-102.1-59-183.1-131-242.1-215-30-42-52-84-65-127.1-14-44-19-87-19-129.1 0-78.1 21-148.1 63-210.1 42-62 101-111 176-147 24-12 50-21 77-28 10-2 19-5 28-7 8-2 17-4 25-6 2-1 3-1 4-2 11-4 22-7 33-9 12-2 24-4 36-4s24 2 36 4c11 2 22 5 33 9 1 1 2 1 4 2 8 2 17 4 25 6 10 2 19 5 28 7 27 7 53 16 77 28 75 36 134 85 176 147 42 62 63 132 63 210.1 0 42-5 85-19 129.1-13 43-35 85-65 127.1-59 84-140 156-242.1 215-7 4-13 8-20 13-9 6-23 14-44 25-8 4-20 10-37 19-17 10-41 23-73 39-31 16-73 35-123 59-15 8-29 19-40 32z"></path>
          </svg>
          <button className="px-4 py-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50">
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">

            {/* Left Side Text */}
            <div className="w-full lg:w-5/12 text-center lg:text-left mb-16 lg:mb-0">
              <h1 className="text-6xl font-bold text-gray-800 leading-tight">
                It's easy to get <br /> started on Attica
              </h1>
            </div>

            {/* Right Side Steps */}
            <div className="w-full lg:w-6/12">
              <div className="space-y-16">
                {steps.map((step) => (
                  <InfoStep key={step.number} {...step} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white">
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">

              <Link
                    to="/listing/step1" // Add the path to your events page
                    className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative"
                >
                  <button className="px-8 py-4 text-white bg-pink-600 rounded-lg font-semibold hover:bg-pink-700">
                      Get started
                  </button>
              </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
