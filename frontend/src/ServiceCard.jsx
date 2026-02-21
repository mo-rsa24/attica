import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaTag } from 'react-icons/fa';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useAuth } from './AuthContext';


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
  const [liked, setLiked] = useState(Boolean(service?.liked));
  const [likeCount, setLikeCount] = useState(Number(service?.likes) || 0);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  useEffect(() => {
    setLiked(Boolean(service?.liked));
    setLikeCount(Number(service?.likes) || 0);
  }, [service?.id, service?.liked, service?.likes]);

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!tokens?.access) {
        navigate('/login');
        return;
    }
    if (isTogglingLike) return;

    setIsTogglingLike(true);
    try {
      const res = await fetch(`/api/vendors/services/${service.id}/like/`, {
        method: liked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access}`,
        },
      });
      if (!res.ok) throw new Error('Like request failed');
      const data = await res.json();
      setLiked(Boolean(data.liked));
      setLikeCount(Number(data.likes) || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTogglingLike(false);
    }
  };

  // Render nothing if the essential service data is missing
  if (!service || !service.vendor) {
    return null;
  }

  return (
    <div
      onClick={() => navigate(`/services/${service.id}`)}
      className="group relative block cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className="relative">
        <img
          src={service.image}
          alt={service.name}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"></div>
        <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 backdrop-blur">
                {service.category_name || 'General'}
            </span>
        </div>
        <button
            onClick={toggleLike}
            disabled={isTogglingLike}
            className="absolute right-4 top-4 z-10 flex items-center rounded-full bg-white/90 px-2.5 py-1.5 text-gray-700 shadow-sm transition-colors hover:bg-white"
        >
            {liked ? <AiFillHeart className="h-4 w-4 text-rose-500"/> : <AiOutlineHeart className="h-4 w-4"/>}
            <span className="ml-1 text-xs font-semibold">{likeCount}</span>
        </button>
        <div
            onClick={(e) => {e.stopPropagation(); navigate(`/vendor/${service.vendor.username}`)}}
            className="absolute bottom-0 left-4 translate-y-1/2"
        >
            <img
                src={service?.vendor?.profile_image || 'https://i.pravatar.cc/150'}
                alt={service?.vendor?.name}
                className="h-16 w-16 rounded-2xl border-4 border-white object-cover shadow-lg transition-transform hover:scale-105"
            />
        </div>
      </div>
      <div className="p-4 pt-11">
        <h4
            onClick={(e) => {e.stopPropagation(); navigate(`/vendor/${service.vendor.username}`)}}
            className="truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-pink-600"
        >
            {service?.vendor?.name}
        </h4>
        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
            {service.name || 'Premium service experience'}
        </p>
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <FaTag className="mr-2 text-pink-500" />
          <span className="line-clamp-1">{service.category_name || 'General Services'}</span>
        </div>
        <div className="mt-1 flex items-center text-sm text-gray-600">
          <FaMapMarkerAlt className="mr-2 text-pink-500" />
          <span className="line-clamp-1">{service.location_tags || 'Not specified'}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <StarRating rating={service.rating} />
            {service.price && (
                 <div className="text-right">
                    <p className="text-lg font-bold text-pink-600">R{service.price}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">starting from</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;
