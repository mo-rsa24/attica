import React from 'react';
import { Link } from 'react-router-dom';

export default function ArtistDashboard() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-rose-100 bg-white/90 p-8 shadow-xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-500">Artist Workspace</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-black text-gray-900">Manage your profile defaults</h2>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Keep your booking fee options, availability, tour defaults, and contact details consistent across all gigs and bookings.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              to="/create/artist"
              className="rounded-2xl bg-gray-900 text-white px-5 py-4 font-semibold hover:bg-gray-800 transition-colors"
            >
              Edit Artist Profile
            </Link>
            <Link
              to="/tours"
              className="rounded-2xl border border-gray-200 bg-white px-5 py-4 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              View Published Tours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
