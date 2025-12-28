import React from 'react';

/**
 * Compact Attica wordmark used across the creation flow to keep the brand consistent.
 */
export default function AtticaMark({ tone = 'light', className = '' }) {
  const isLight = tone === 'light';
  const textColor = isLight ? 'text-white' : 'text-slate-900';
  const subColor = isLight ? 'text-white/70' : 'text-slate-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 border border-white/20">
        <svg
          viewBox="0 0 1000 1000"
          role="presentation"
          aria-hidden="true"
          focusable="false"
          className="h-7 w-7"
          style={{ display: 'block', fill: 'currentColor' }}
        >
          <path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-21 41-32 72-32 31 0 54 11 72 32 17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43.2c-11-12.9-25-23.9-40-31.9-50-23.9-92-42.9-123-58.9-32-16-56-28.9-73-38.9-17-9-29-15-37-19-21-10.9-35-18.9-44-24.9-7-5-13-9-20-13-102.1-59-183.1-131-242.1-215-30-42-52-84-65-127.1-14-44-19-87-19-129.1 0-78.1 21-148.1 63-210.1 42-62 101-111 176-147 24-12 50-21 77-28 10-2 19-5 28-7 8-2 17-4 25-6 2-1 3-1 4-2 11-4 22-7 33-9 12-2 24-4 36-4s24 2 36 4c11 2 22 5 33 9 1 1 2 1 4 2 8 2 17 4 25 6 10 2 19 5 28 7 27 7 53 16 77 28 75 36 134 85 176 147 42 62 63 132 63 210.1 0 42-5 85-19 129.1-13 43-35 85-65 127.1-59 84-140 156-242.1 215-7 4-13 8-20 13-9 6-23 14-44 25-8 4-20 10-37 19-17 10-41 23-73 39-31 16-73 35-123 59-15 8-29 19-40 32z"></path>
        </svg>
      </div>
      <div className="leading-tight">
        <p className={`font-black text-lg tracking-tight ${textColor}`}>Attica</p>
        <p className={`text-[11px] uppercase tracking-[0.16em] font-semibold ${subColor}`}>
          Event Studio
        </p>
      </div>
    </div>
  );
}

