import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

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

function ReservationWidget({price}) {
  return (
    <div className="border p-4 rounded-xl shadow sticky top-24">
      <div className="text-xl font-semibold">${price} <span className="text-base font-normal">per event</span></div>
      <div className="mt-4 space-y-2">
        <input type="date" className="w-full border rounded p-2" />
        <input type="date" className="w-full border rounded p-2" />
        <input type="number" min="1" defaultValue="1" className="w-full border rounded p-2" />
        <button className="w-full bg-red-500 text-white py-2 rounded">Reserve</button>
        <p className="text-xs text-center mt-2">You won't be charged yet</p>
      </div>
    </div>
  )
}

export default function ListingPage() {
  const {id} = useParams()
  const [service, setService] = useState(null)

  useEffect(() => {
    fetch(`/api/vendors/services/${id}/`)
      .then(res => res.json())
      .then(data => setService(data))
      .catch(() => {})
  }, [id])

  if (!service) return null
  const images = [service.image, ...(service.gallery?.map(g => g.image) || [])]

  return (
    <div className="max-w-screen-lg mx-auto px-4 md:px-8">
      <h1 className="text-2xl font-semibold mt-6">{service.name}</h1>
      <p className="text-sm text-gray-600 mt-1">Hosted by {service.vendor.name}</p>
      <ImageGallery images={images} />

      <div className="md:grid md:grid-cols-[70%_30%] gap-6 mt-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">About this service</h2>
            <p className="leading-relaxed">{service.description}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Reviews</h2>
            <div className="space-y-4">
              {service.reviews.map(r => (
                <div key={r.id} className="border-b pb-4">
                  <p className="font-semibold">{r.user}</p>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ReservationWidget price={service.price} />
      </div>
    </div>
  )
}