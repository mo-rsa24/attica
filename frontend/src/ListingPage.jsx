import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

/** 1️⃣ Hero Image Gallery **/
function ImageGallery({images}) {
 const [open, setOpen] = useState(false)
 const [index, setIndex] = useState(0)
 const hero = images[0]
 const thumbs = images.slice(1,5)

 return (
   <div className="relative">
     <div className="grid grid-cols-4 grid-rows-2 gap-2 h-80 rounded-xl overflow-hidden">
       <div className="col-span-2 row-span-2">
         <img src={hero} alt="" className="h-full w-full object-cover" />
       </div>
       {thumbs.map((img, i) => (
         <button key={i} className="col-span-1" onClick={() => {setIndex(i+1); setOpen(true)}}>
           <img src={img} alt="" className="h-full w-full object-cover hover:scale-105 transition" />
         </button>
       ))}
       {images.length > 5 && (
         <button onClick={() => {setIndex(0); setOpen(true)}} className="absolute top-2 right-2 bg-white px-3 py-1 text-sm rounded-md shadow">Show all photos</button>
       )}
     </div>
     {open && (
       <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
         <button onClick={() => setOpen(false)} className="text-white absolute top-4 right-4 text-2xl">✕</button>
         <div className="flex items-center gap-4 w-full max-w-4xl">
           <button onClick={() => setIndex((index-1+images.length)%images.length)} className="text-white text-3xl">‹</button>
           <img src={images[index]} alt="" className="max-h-[80vh] object-contain" />
           <button onClick={() => setIndex((index+1)%images.length)} className="text-white text-3xl">›</button>
         </div>
       </div>
     )}
   </div>
 )
}

/** 2️⃣ Title, Host & Metadata **/
function TitleMetadata({ name, rating, reviewsCount, vendor }) {
 return (
   <div className="mt-6">
     <h1 className="text-3xl font-semibold">{name}</h1>
     <div className="flex flex-wrap items-center text-gray-600 text-sm mt-2 space-x-2">
       <span>★ {rating}</span>
       <span>· {reviewsCount} reviews</span>
       {vendor.isSuperhost && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">Superhost</span>}
       <span>· JGB, RSA</span>
     </div>
     <p className="text-gray-600 text-sm mt-1">Hosted by <span className="font-medium">{vendor.name}</span></p>
   </div>
 );
}

/** 3️⃣ Quick Facts **/
function QuickFacts({ stats }) {
 return (
    <div className="flex flex-wrap gap-6 text-gray-700 text-sm">
      {stats.map(({ icon, label }, i) => (
        <div key={i} className="flex items-center space-x-2">
          {icon && <img src={icon} alt="" className="w-5 h-5" />}
          {!icon && <span className="w-5 h-5 bg-gray-300 rounded-full flex-shrink-0" />}
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/** 4️⃣ Description **/
function Description({ text }) {
 const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">About this place</h2>
     <p className={`text-gray-800 leading-relaxed transition-[max-height] duration-300 overflow-hidden ${expanded ? 'max-h-[1000px]' : 'max-h-20'}`}>
       {text}
     </p>
     <button className="mt-1 text-sm text-gray-600 hover:underline" onClick={() => setExpanded(!expanded)}>
       {expanded ? 'Show less' : 'Show more'}
     </button>
   </div>
 );
}


/** 6️⃣ Host Profile **/
function HostProfile({ host }) {
return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <div className="flex items-center space-x-4">
        <img src={host.profile_image} alt={host.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h3 className="text-lg font-semibold">{host.name}</h3>
          <p className="text-sm text-gray-600">{host.service_count} services · ⭐ {host.rating}</p>
        </div>
      </div>
      {host.description && <p className="mt-4 text-gray-700">{host.description}</p>}
    </div>
  );
}
function Amenities({ items }) {
    if (!items?.length) return null;
    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Amenities</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                {items.map((a) => (
                    <li key={a.id} className="flex items-center space-x-2">
                        {a.icon && <img src={a.icon} alt="" className="w-5 h-5"/>}
                        <span>{a.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** 7️⃣ Reviews **/
function Reviews({ reviews }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">What guests are saying</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reviews.map((r, idx) => (
          <div key={r.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <img src={r.user_avatar} alt={r.user_name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-medium">{r.user_name}</p>
                {r.rating && (
                  <div className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                )}
              </div>
            </div>
            <p className={`text-sm text-gray-700 leading-relaxed ${expanded === idx ? '' : 'line-clamp-3'}`}>{r.comment}</p>
            {r.comment.length > 100 && (
              <button onClick={() => setExpanded(expanded === idx ? null : idx)} className="text-sm text-gray-600 mt-1">
                {expanded === idx ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 8️⃣ Location Map **/
function LocationMap({ coords }) {
 const { lat, lng } = coords || {};
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Location</h2>
      {lat && lng ? (
        <iframe
          title="map"
          className="w-full h-64 rounded-lg"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        />
      ) : (
        <div className="h-64 w-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">Map unavailable</div>
      )}
      <p className="mt-2 text-sm text-gray-500">Exact location provided after booking.</p>
    </div>
  );
}

/** 9️⃣ Policies Accordion **/
function PoliciesAccordion({ policies }) {
 const [openIndex, setOpenIndex] = useState(null);
 return (
   <div>
     <h2 className="text-xl font-semibold mb-4">Policies & Safety</h2>
     {policies.map((p, i) => (
       <div key={i} className="border-t border-gray-200">
         <button
           className="w-full text-left py-3 flex justify-between items-center text-gray-700"
           onClick={() => setOpenIndex(openIndex === i ? null : i)}
         >
           <span>{p.title}</span>
           <span>{openIndex === i ? '–' : '+'}</span>
         </button>
         {openIndex === i && (
           <div className="p-4 text-sm text-gray-600">
             {p.content}
           </div>
         )}
       </div>
     ))}
   </div>
 );
}

/** 🔟 Similar Listings Carousel **/
function SimilarListings({ listings }) {
 return (
   <div>
     <h2 className="text-xl font-semibold mb-4">Similar services in this area</h2>
     <div className="flex overflow-x-auto space-x-4 pb-4">
       {listings.map(l => (
         <div key={l.id} className="min-w-[200px] bg-white rounded-lg shadow overflow-hidden">
           <img src={l.image} alt={l.name} className="h-32 w-full object-cover" />
           <div className="p-3">
             <p className="font-medium text-sm">{l.name}</p>
             <p className="text-sm text-gray-600">${l.price}/night</p>
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}

/** Reservation Widget (Sticky on Desktop) **/
function ReservationWidget({ price, serviceId }) {
 return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-24">
      <div className="text-2xl font-semibold">${price} <span className="text-base font-normal">per day</span></div>
      <div className="mt-4 space-y-3">
        <input type="date" className="w-full border rounded-lg p-2" />
        <input type="date" className="w-full border rounded-lg p-2" />
        <input type="number" min="1" defaultValue="1" className="w-full border rounded-lg p-2" />
        <Link to={`/services/${serviceId}/request`} className="block">
          <button className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition">Reserve</button>
        </Link>
        <p className="text-xs text-center text-gray-500 mt-2">You won't be charged yet</p>
      </div>
    </div>
  );
}

/** ✅ Main Listing Page **/
/* eslint-disable react-refresh/only-export-components */
export default function ListingPage() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [similar, setSimilar] = useState([]);

 useEffect(() => {
     fetch(`/api/vendors/services/${id}/`)
    .then(res => res.json())
    .then(data => setService(data))
    .catch(() => {});

  fetch(`/api/vendors/services/${id}/similar/`)
    .then(res => res.json())
    .then(data => setSimilar(data))
    .catch(() => {});
}, [id]);

 if (!service) return <div className="text-center py-20">Loading…</div>;

 // Prepare data
 const images = [service.image, ...(service.gallery?.map((g) => g.image) || [])];
 const quickStats = service.amenities?.map((a) => ({ label: a.name, icon: a.icon })) || [];
 const policies = service.policies?.map((p) => ({ title: p.type, content: p.text })) || [];

 return (
   <div className="max-w-screen-lg mx-auto px-4 md:px-8 mt-6">
     <ImageGallery images={images} />

     <TitleMetadata
       name={service.name}
       rating={service.rating}
       reviewsCount={service.reviews.length}
       location={service.location}
       vendor={service.vendor}
     />

     <div className="md:flex md:space-x-8 mt-6">
       {/* Left/Main Column */}
       <div className="md:flex-1 space-y-10">
         <QuickFacts stats={quickStats} />
        <Description text={service.description} />
        <Amenities items={service.amenities} />
         <HostProfile host={service.vendor} />
         <Reviews reviews={service.reviews} />
        <LocationMap coords={{ lat: service.latitude, lng: service.longitude }} />
        <PoliciesAccordion policies={policies} />
        <SimilarListings listings={similar} />
       </div>

       {/* Right/Sticky Column */}
       <div className="md:w-80 mt-8 md:mt-0">
          <ReservationWidget price={service.price} serviceId={service.id} />
       </div>
     </div>
   </div>
 );
}

