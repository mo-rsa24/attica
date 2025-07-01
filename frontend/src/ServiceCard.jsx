import { useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'

function ServiceCard({ service }) {
    const [liked, setLiked] = useState(service.liked)
    const [count, setCount] = useState(service.likes)
    const [loaded, setLoaded] = useState(false)

  const toggleLike = () => {
    fetch(`/vendors/api/services/${service.id}/like/`, {
      method: liked ? 'DELETE' : 'POST',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setLiked(data.liked)
        setCount(data.likes)
      })
      .catch(() => {})
  }

  return (
      <div
          className="relative rounded-xl bg-white shadow-md hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden min-w-[250px]">
          <button
              onClick={toggleLike}
              className="absolute top-2 right-2 z-10 text-gray-600 hover:text-rose-500"
          >
              {liked ? <AiFillHeart className="w-5 h-5"/> : <AiOutlineHeart className="w-5 h-5"/>}
              <span className="ml-1 text-xs font-medium">{count}</span>
          </button>
          {!loaded && <div className="absolute inset-0 bg-gray-100 animate-pulse"/>}
          <img
              src={service.image}
              alt={service.name}
              className={`w-full h-48 object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLoaded(true)}
              loading="lazy"
          />
          <div className="p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                  <img
                      src={service.vendor.profile_image || '/static/default_profile.jpg'}
                      alt={service.vendor.name}
                      className="w-8 h-8 rounded-full object-cover cursor-pointer"
                      onClick={() => (window.location.href = `/vendor/${service.vendor.id}`)}
                  />
                  <span
                      onClick={() => (window.location.href = `/vendor/${service.vendor.id}`)}
                      className="text-sm font-medium cursor-pointer truncate"
                  >
            {service.vendor.name}
          </span>
              </div>
              <h4 className="text-base font-semibold truncate">{service.name}</h4>
              <p className="text-sm text-gray-500 truncate">
                  {service.category_name} · {service.location_tags}
              </p>
              <div className="flex items-center justify-between text-sm mt-1">
                  <span>⭐ {service.rating}</span>
                  {service.price && <span className="font-medium">${service.price}</span>}
              </div>
          </div>
      </div>
  )
}

export default ServiceCard
