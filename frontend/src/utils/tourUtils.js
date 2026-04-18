export const formatTourDate = (date, locale = undefined) => {
  if (!date) return 'TBA';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'TBA';
  return parsed.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const normalizeTourList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return trimmed
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
};

export const mapArtistToTour = (artist) => ({
  artist,
  startDate: artist?.tour_start_date || null,
  endDate: artist?.tour_end_date || null,
  cities: normalizeTourList(artist?.tour_cities),
  clubs: normalizeTourList(artist?.tour_clubs),
  ticketPrice: artist?.general_ticket_price || null,
});

export const hasTourContent = (tour) =>
  Boolean(
    tour?.startDate ||
      tour?.endDate ||
      (Array.isArray(tour?.cities) && tour.cities.length > 0) ||
      (Array.isArray(tour?.clubs) && tour.clubs.length > 0),
  );

export const buildTourStops = (tour) => {
  const cities = Array.isArray(tour?.cities) ? tour.cities : [];
  const clubs = Array.isArray(tour?.clubs) ? tour.clubs : [];
  const totalStops = Math.max(cities.length, clubs.length);

  if (totalStops === 0) return [];

  return Array.from({ length: totalStops }, (_, index) => ({
    stopNumber: index + 1,
    city: cities[index] || cities[cities.length - 1] || 'City to be announced',
    venue: clubs[index] || clubs[clubs.length - 1] || 'Venue to be announced',
  }));
};
