import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaSpinner } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { schedulingFormatters } from './api/schedulingApi';

const { formatDateTime } = schedulingFormatters;

function StarRating({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          className="text-3xl transition-colors disabled:cursor-default"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <FaStar
            className={
              star <= (hover || value)
                ? 'text-amber-400'
                : 'text-gray-200'
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-amber-600">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const { bookingId } = useParams();
  const { tokens, user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    if (!tokens?.access || !bookingId) return;
    setLoading(true);
    setError('');
    try {
      const [bookingRes, reviewRes] = await Promise.all([
        fetch(`/api/scheduling/bookings/${bookingId}/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }),
        fetch(`/api/scheduling/reviews/?booking=${bookingId}`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }),
      ]);

      if (!bookingRes.ok) {
        setError(bookingRes.status === 404 ? 'Booking not found.' : 'Failed to load booking.');
        return;
      }

      const bookingData = await bookingRes.json();
      setBooking(bookingData);

      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        const results = Array.isArray(reviewData) ? reviewData : reviewData.results || [];
        setAllReviews(results);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [tokens, bookingId]);

  useEffect(() => { load(); }, [load]);

  // Determine role for this user on this booking
  const reviewerType = useMemo(() => {
    if (!booking || !user) return null;
    if (booking.organizer === user.id || booking.organizer_id === user.id) return 'organizer';
    if (booking.resource_owner_id === user.id) return 'provider';
    return null;
  }, [booking, user]);

  // Find this user's existing review (by their reviewer_type side)
  const existingReview = useMemo(() => {
    if (!reviewerType) return null;
    return allReviews.find((r) => r.reviewer_type === reviewerType) || null;
  }, [allReviews, reviewerType]);

  // Pre-fill form if existing review found
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  const reviewCopy = useMemo(() => {
    if (reviewerType === 'provider') {
      return {
        heading: booking?.organizer_username ? `Review @${booking.organizer_username}` : 'Review this organizer',
        prompt: 'How was working with this event organizer?',
        placeholder: 'Share what the experience was like — communication, professionalism, payment promptness…',
        thankYou: 'Thank you for your feedback!',
        thankYouSub: 'Your review helps other providers decide who to work with.',
      };
    }
    return {
      heading: booking?.resource_display_name || 'Review this provider',
      prompt: 'How would you rate this provider?',
      placeholder: 'Tell others about your experience — quality, professionalism, reliability…',
      thankYou: 'Thank you for your review!',
      thankYouSub: 'Your feedback helps other organizers find great providers.',
    };
  }, [reviewerType, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError('Please select a star rating.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/scheduling/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({ booking: bookingId, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.detail || JSON.stringify(data) || 'Submission failed.');
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <FaSpinner className="animate-spin text-2xl" />
        <span>Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-pink-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  if (!booking) return null;

  if (!reviewerType) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-black text-gray-900">Not your booking</h2>
        <p className="text-gray-500 mt-2 text-sm">Only the organizer or provider on this booking can leave a review.</p>
        <button onClick={() => navigate(-1)} className="mt-5 text-sm text-pink-600 hover:underline">← Back</button>
      </div>
    );
  }

  if (booking.status !== 'completed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-black text-gray-900">Reviews are available after completion</h2>
        <p className="text-gray-500 mt-2 text-sm">
          This booking is <span className="font-semibold capitalize">{booking.status}</span>.
          Reviews can only be submitted once the booking is marked complete.
        </p>
        <button onClick={() => navigate(-1)} className="mt-5 text-sm text-pink-600 hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🌟</div>
        <h2 className="text-2xl font-black text-gray-900">{reviewCopy.thankYou}</h2>
        <p className="text-gray-500 mt-2 text-sm">{reviewCopy.thankYouSub}</p>
        <button
          onClick={() => navigate(`/booking-detail/${bookingId}`)}
          className="mt-6 inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Back to booking
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-amber-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>

        {/* Booking summary card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-500">
            {reviewerType === 'provider' ? 'Review organizer' : 'Leave a review'}
          </p>
          <h1 className="mt-1 text-xl font-black text-gray-900">{reviewCopy.heading}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatDateTime(booking.start_at)} — {formatDateTime(booking.end_at)}
          </p>
          {reviewerType === 'provider' && (
            <p className="mt-2 text-xs text-gray-400">
              Your review will be visible on the organizer's public profile.
            </p>
          )}
        </div>

        {/* Other side's review (read-only preview) */}
        {allReviews.some((r) => r.reviewer_type !== reviewerType) && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 text-sm">
            <p className="font-semibold text-blue-800 mb-1">
              {reviewerType === 'organizer' ? 'Provider has already reviewed this booking' : 'Organizer has already reviewed this booking'}
            </p>
            {allReviews
              .filter((r) => r.reviewer_type !== reviewerType)
              .map((r) => (
                <div key={r.id} className="mt-2">
                  <StarRating value={r.rating} disabled />
                  {r.comment && <p className="text-blue-700 text-xs italic mt-1">"{r.comment}"</p>}
                </div>
              ))}
          </div>
        )}

        {/* Existing review (read-only) or form */}
        {existingReview && !submitted ? (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-4">
            <p className="font-bold text-gray-900">Your review</p>
            <StarRating value={existingReview.rating} disabled />
            {existingReview.comment && (
              <p className="text-gray-700 text-sm italic">"{existingReview.comment}"</p>
            )}
            <p className="text-xs text-gray-400">Submitted {formatDateTime(existingReview.created_at)}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {reviewCopy.prompt}
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="review-comment">
                Comment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={reviewCopy.placeholder}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaStar />}
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
