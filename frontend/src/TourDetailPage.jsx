import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Building2, CalendarDays, ChevronLeft, ChevronRight, MapPin, Music2, Play, Sparkles, Ticket } from 'lucide-react';
import { buildTourStops, formatTourDate, hasTourContent, mapArtistToTour } from './utils/tourUtils';

const TOUR_PLACEHOLDER_IMAGE = 'https://placehold.co/1400x900/2f1d19/F7EDE2?text=Artist+Tour';
const TOUR_GUIDE_IMAGE_FIELDS = ['image_url', 'image', 'url', 'src', 'photo', 'thumbnail', 'cover'];

const formatTicketPrice = (value) => {
  if (value === null || value === undefined || value === '') return 'Ticket price TBA';
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return `From R${numeric.toFixed(2)}`;
  return `From R${value}`;
};

const getTourFromRouteState = (state, id) => {
  const stateTour = state?.tour;
  if (!stateTour?.artist?.id) return null;
  return String(stateTour.artist.id) === String(id) ? stateTour : null;
};

const toArrayValue = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch {
      if (!trimmed.includes(',')) return [trimmed];
      return trimmed
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const extractImageFromValue = (value) => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return '';

  for (const key of TOUR_GUIDE_IMAGE_FIELDS) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();

    if (candidate && typeof candidate === 'object') {
      if (typeof candidate.url === 'string' && candidate.url.trim()) return candidate.url.trim();
      if (typeof candidate.src === 'string' && candidate.src.trim()) return candidate.src.trim();
    }
  }

  return '';
};

const extractTourGuideImages = (tour, artist) => {
  const sources = [
    tour?.tour_images,
    tour?.guide_images,
    tour?.images,
    tour?.gallery,
    tour?.media,
    artist?.tour_images,
    artist?.guide_images,
    artist?.images,
    artist?.gallery,
    artist?.portfolio,
  ];

  const imageUrls = sources.flatMap((source) =>
    toArrayValue(source)
      .map((item) => extractImageFromValue(item))
      .filter(Boolean),
  );

  return [...new Set(imageUrls)];
};

const getCoverflowOffset = (index, activeIndex, total) => {
  if (total <= 0) return 0;

  let offset = index - activeIndex;
  const midpoint = total / 2;

  if (offset > midpoint) offset -= total;
  if (offset < -midpoint) offset += total;

  return offset;
};

export default function TourDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const stateTour = getTourFromRouteState(location.state, id);
  const [tour, setTour] = useState(stateTour);
  const [isLoading, setIsLoading] = useState(!stateTour);
  const [error, setError] = useState('');
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const initialTour = getTourFromRouteState(location.state, id);

    if (initialTour && hasTourContent(initialTour)) {
      setTour(initialTour);
      setIsLoading(false);
      setError('');
      return () => {
        isMounted = false;
      };
    }

    const fetchArtistTour = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/artists/artists/${id}/`);
        if (!response.ok) throw new Error('Unable to load this tour right now.');
        const artist = await response.json();
        const normalizedTour = mapArtistToTour(artist);

        if (!hasTourContent(normalizedTour)) {
          throw new Error('This artist has not published a tour guide yet.');
        }

        if (isMounted) {
          setTour(normalizedTour);
        }
      } catch (err) {
        if (isMounted) {
          setTour(null);
          setError(err?.message || 'Unable to load this tour right now.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchArtistTour();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  const itinerary = useMemo(() => buildTourStops(tour), [tour]);
  const storyImages = useMemo(() => extractTourGuideImages(tour, tour?.artist), [tour]);
  const storyCards = useMemo(() => {
    const artistName = tour?.artist?.name || 'Featured Artist';
    const artistBio =
      tour?.artist?.bio ||
      `${artistName} is currently on tour. Check the stops below and plan your booking around the live route.`;
    const fallbackImage = tour?.artist?.profile_image || TOUR_PLACEHOLDER_IMAGE;
    const itineraryCards = itinerary.map((stop, index) => ({
      id: `stop-${stop.stopNumber}-${index}`,
      kicker: `Stop ${stop.stopNumber}`,
      title: stop.city || 'City to be announced',
      description: `Venue: ${stop.venue || 'To be announced'}`,
    }));
    const cards = itineraryCards.length > 0 ? itineraryCards : [];

    cards.push({
      id: 'artist-bio',
      kicker: 'Artist Bio',
      title: artistName,
      description: artistBio,
    });

    return cards.map((card, index) => {
      const image =
        storyImages[index] ||
        (storyImages.length > 0 ? storyImages[index % storyImages.length] : fallbackImage);

      return {
        ...card,
        image,
      };
    });
  }, [itinerary, storyImages, tour]);

  useEffect(() => {
    setActiveStoryIndex(0);
  }, [id, storyCards.length]);

  const stepStory = (direction) => {
    if (storyCards.length < 2) return;

    setActiveStoryIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0) return storyCards.length - 1;
      if (nextIndex >= storyCards.length) return 0;
      return nextIndex;
    });
  };

  const handleStoryKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepStory(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepStory(1);
    }
  };

  if (isLoading) {
    return (
      <div className="tour-detail-page min-h-screen py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse rounded-[2rem] h-72 bg-[#f5e6de]/80 border border-[#dfc0b1]/70 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
            <div className="animate-pulse rounded-3xl h-[420px] bg-white/75 border border-[#e8cec2]" />
            <div className="animate-pulse rounded-3xl h-[420px] bg-white/75 border border-[#e8cec2]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-detail-page min-h-screen py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-3xl border border-rose-200 bg-white/90 p-8 sm:p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.26em] text-rose-600 font-semibold mb-3">Tour unavailable</p>
          <h1 className="tour-detail-display text-3xl sm:text-4xl text-[#351d17] mb-4">We could not open this tour</h1>
          <p className="text-[#6a4d43] mb-6">{error}</p>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-[#7f3f2d] text-[#fff3ea] font-medium hover:bg-[#6d3526] transition-colors"
          >
            <ChevronLeft size={18} />
            Back to tours
          </Link>
        </div>
      </div>
    );
  }

  if (!tour?.artist) {
    return (
      <div className="tour-detail-page min-h-screen py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-3xl border border-[#e3c8bc] bg-white/90 p-8 sm:p-10 shadow-xl">
          <h1 className="tour-detail-display text-3xl sm:text-4xl text-[#351d17] mb-4">Tour not found</h1>
          <p className="text-[#6a4d43] mb-6">This tour could not be found. It may have been removed.</p>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-[#7f3f2d] text-[#fff3ea] font-medium hover:bg-[#6d3526] transition-colors"
          >
            <ChevronLeft size={18} />
            Back to tours
          </Link>
        </div>
      </div>
    );
  }

  const artist = tour.artist;
  const heroImage = artist.profile_image || TOUR_PLACEHOLDER_IMAGE;
  const genreText = artist.genres || 'Genre to be announced';
  const ticketPrice = formatTicketPrice(tour.ticketPrice);
  const artistProfileRoute = artist?.id ? `/artists/${artist.id}` : '/artists';
  const displayBio =
    artist.bio ||
    `${artist.name || 'This artist'} is currently on tour. Check the stops below and plan your booking around the live route.`;
  const dateWindow = `${formatTourDate(tour.startDate)} to ${formatTourDate(tour.endDate)}`;

  return (
    <div className="tour-detail-page min-h-screen relative overflow-hidden pb-16">
      <div className="tour-detail-bg-layer tour-detail-bg-layer--mesh" />
      <div className="tour-detail-bg-layer tour-detail-bg-layer--grain" />
      <div className="tour-detail-orb tour-detail-orb--one" />
      <div className="tour-detail-orb tour-detail-orb--two" />
      <div className="tour-detail-orb tour-detail-orb--three" />

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/tours"
          className="inline-flex items-center gap-2 rounded-full border border-[#dfb4a2]/80 bg-white/85 px-4 py-2 text-sm font-medium text-[#5a2e23] hover:bg-white transition-colors"
        >
          <ChevronLeft size={17} />
          Back to tours
        </Link>

        <div className="tour-detail-hero mt-4 rounded-[2rem] overflow-hidden border border-white/45 shadow-[0_36px_80px_-42px_rgba(60,27,19,0.85)]">
          <img src={heroImage} alt={artist.name || 'Artist'} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#271611]/95 via-[#5a3125]/82 to-[#c27656]/46" />
          <div className="absolute inset-0 tour-detail-hero-noise" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-8 p-6 sm:p-8 lg:p-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#f6e8dd66] bg-[#fff2ea1a] px-3 py-1 text-xs uppercase tracking-[0.26em] text-[#fbe6d6] font-semibold">
                <Sparkles size={14} />
                Artist Tour Guide
              </p>
              <h1 className="tour-detail-display mt-5 text-4xl sm:text-5xl lg:text-6xl leading-[1.03] text-[#fff3ea]">
                {artist.name || 'Featured Artist'}
                <span className="block text-[#ffd7bf]">On Tour</span>
              </h1>
              <p className="mt-4 max-w-2xl text-[#fce9db]/90 text-sm sm:text-base leading-relaxed">{displayBio}</p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3ea1a] border border-[#f7d8c6a3] px-3.5 py-1.5 text-xs sm:text-sm text-[#fdf0e6]">
                  <Music2 size={15} />
                  {genreText}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3ea1a] border border-[#f7d8c6a3] px-3.5 py-1.5 text-xs sm:text-sm text-[#fdf0e6]">
                  <MapPin size={15} />
                  {tour.cities.length || 0} {tour.cities.length === 1 ? 'City Stop' : 'City Stops'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3ea1a] border border-[#f7d8c6a3] px-3.5 py-1.5 text-xs sm:text-sm text-[#fdf0e6]">
                  <Building2 size={15} />
                  {tour.clubs.length || 0} {tour.clubs.length === 1 ? 'Venue' : 'Venues'}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#f4d5c4a8] bg-[#fff2ea24] backdrop-blur-lg p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#fce7d7] mb-3 font-semibold">Tour Window</p>
              <div className="rounded-2xl bg-[#fff0e63d] border border-[#f5d7c6] px-4 py-3 mb-4">
                <p className="text-[#fff2ea] text-sm sm:text-base font-semibold leading-relaxed">{dateWindow}</p>
              </div>

              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex items-center justify-between gap-4 border-b border-[#f6dacb66] pb-3">
                  <span className="inline-flex items-center gap-2 text-[#fce8da]/86">
                    <Ticket size={16} />
                    Ticket
                  </span>
                  <span className="font-semibold text-[#fff4ed]">{ticketPrice}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-[#f6dacb66] pb-3">
                  <span className="inline-flex items-center gap-2 text-[#fce8da]/86">
                    <CalendarDays size={16} />
                    Duration
                  </span>
                  <span className="font-semibold text-[#fff4ed]">
                    {tour.startDate && tour.endDate ? 'Scheduled' : 'Date to be announced'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-[#fce8da]/86">
                    <MapPin size={16} />
                    Stops
                  </span>
                  <span className="font-semibold text-[#fff4ed]">{itinerary.length || 'TBA'}</span>
                </div>
              </div>

              <Link
                to={artistProfileRoute}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#f8dccd] bg-[#fff4ec] px-4 py-3 text-sm sm:text-base font-semibold text-[#5f3124] hover:bg-[#ffe8da] transition-colors"
              >
                View artist profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
          <article className="tour-detail-panel rounded-3xl border border-[#e5c7b9] bg-white/88 backdrop-blur-sm shadow-[0_22px_45px_-30px_rgba(76,33,23,0.65)] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#8f5a49] font-semibold">Stops & Venues</p>
                <h2 className="tour-detail-display text-3xl sm:text-4xl text-[#351d17] mt-1">Tour itinerary</h2>
              </div>
            </div>

            {itinerary.length > 0 ? (
              <ol className="space-y-4">
                {itinerary.map((stop) => (
                  <li
                    key={`${stop.stopNumber}-${stop.city}-${stop.venue}`}
                    className="relative pl-14 rounded-2xl border border-[#edd4ca] bg-[#fffaf6] px-4 py-4"
                  >
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#b56748] to-[#8f472f] text-[#fff6ef] text-sm font-semibold flex items-center justify-center">
                      {stop.stopNumber}
                    </span>
                    <p className="text-sm uppercase tracking-[0.2em] text-[#9b6452] font-semibold">City</p>
                    <p className="text-[#3f2219] font-semibold text-lg">{stop.city}</p>
                    <p className="mt-1 text-sm text-[#70473b]">Venue: {stop.venue}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[#70473b]">Stops are being finalized. Check back soon for the full route.</p>
            )}
          </article>

          <aside className="space-y-6">
            <article className="tour-detail-panel rounded-3xl border border-[#e5c7b9] bg-white/88 backdrop-blur-sm shadow-[0_22px_45px_-30px_rgba(76,33,23,0.65)] p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8f5a49] font-semibold mb-3">Highlights</p>
              <h2 className="tour-detail-display text-2xl text-[#351d17] mb-4">Why this guide attracts attention</h2>
              <ul className="space-y-3 text-sm text-[#68463a]">
                <li className="rounded-xl border border-[#efd9d1] bg-[#fff9f5] px-4 py-3">Clear route across cities and clubs for easy planning.</li>
                <li className="rounded-xl border border-[#efd9d1] bg-[#fff9f5] px-4 py-3">Polished artist presence with branded editorial visuals.</li>
                <li className="rounded-xl border border-[#efd9d1] bg-[#fff9f5] px-4 py-3">Fast access to artist profile and booking context.</li>
              </ul>
            </article>

            <article className="tour-detail-panel rounded-3xl border border-[#e5c7b9] bg-white/88 backdrop-blur-sm shadow-[0_22px_45px_-30px_rgba(76,33,23,0.65)] p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8f5a49] font-semibold mb-3">Artist Bio</p>
              <h2 className="tour-detail-display text-2xl text-[#351d17] mb-3">{artist.name || 'Artist'}</h2>
              <p className="text-sm text-[#68463a] leading-relaxed">{displayBio}</p>
              <Link
                to={artistProfileRoute}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#7f3f2d] px-4 py-3 text-sm font-semibold text-[#fff3ea] hover:bg-[#6d3526] transition-colors"
              >
                Open artist profile
              </Link>
            </article>
          </aside>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="tour-story-reel rounded-[2rem] border border-[#e7c4b6]/55 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#f7d7c6] font-semibold">Tour Visual Stories</p>
              <h2 className="tour-detail-display text-3xl sm:text-4xl lg:text-5xl text-[#fff3ea] mt-2">Stories from the Circle</h2>
            </div>
            <p className="max-w-2xl text-sm sm:text-base text-[#f8e6dc]/88">
              Swipe through moments captured while building this guide and see each stop with visual context.
            </p>
          </div>

          <div
            className="tour-coverflow mt-8"
            role="region"
            aria-label="Tour stories carousel"
            tabIndex={0}
            onKeyDown={handleStoryKeyDown}
          >
            <button
              type="button"
              className="tour-coverflow-nav"
              onClick={() => stepStory(-1)}
              disabled={storyCards.length <= 1}
              aria-label="Previous story"
            >
              <ChevronLeft size={21} />
            </button>

            <div className="tour-coverflow-viewport">
              <div className="tour-coverflow-track">
                {storyCards.map((card, index) => {
                  const offset = getCoverflowOffset(index, activeStoryIndex, storyCards.length);
                  const absOffset = Math.abs(offset);
                  const clampedOffset = Math.min(absOffset, 3);
                  const isActive = offset === 0;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={`tour-coverflow-card ${isActive ? 'is-active' : ''}`}
                      style={{
                        '--coverflow-offset': offset,
                        '--coverflow-abs-offset': clampedOffset,
                        zIndex: 20 - Math.round(absOffset),
                        opacity: absOffset > 3 ? 0 : 1 - absOffset * 0.2,
                        pointerEvents: absOffset > 2 ? 'none' : 'auto',
                      }}
                      onClick={() => setActiveStoryIndex(index)}
                      aria-label={`Focus story ${index + 1}: ${card.title}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <img src={card.image} alt={`${card.title} visual`} className="tour-coverflow-image" loading="lazy" />
                      <div className="tour-coverflow-sheen" />
                      <div className="tour-coverflow-overlay" />
                      <span className="tour-coverflow-play" aria-hidden="true">
                        <Play size={20} fill="currentColor" />
                      </span>
                      <div className="tour-coverflow-copy">
                        <p className="tour-coverflow-kicker">{card.kicker}</p>
                        <h3 className="tour-coverflow-title">{card.title}</h3>
                        <p className="tour-coverflow-description">{card.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="tour-coverflow-nav"
              onClick={() => stepStory(1)}
              disabled={storyCards.length <= 1}
              aria-label="Next story"
            >
              <ChevronRight size={21} />
            </button>
          </div>

          {storyCards.length > 1 ? (
            <div className="tour-coverflow-dots mt-6" role="tablist" aria-label="Select tour story">
              {storyCards.map((card, index) => (
                <button
                  key={`story-dot-${card.id}`}
                  type="button"
                  className={`tour-coverflow-dot ${index === activeStoryIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveStoryIndex(index)}
                  aria-label={`Open story ${index + 1}`}
                  aria-current={index === activeStoryIndex ? 'true' : undefined}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
