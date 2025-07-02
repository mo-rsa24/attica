import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Typography, Box, CardMedia } from '@mui/material'

export default function VendorProfile() {
  const { username } = useParams()
  const [vendor, setVendor] = useState(null)
  const [showFullBio, setShowFullBio] = useState(false)

  useEffect(() => {
    fetch(`/api/vendors/by-username/${username}/`)
       .then((res) => res.json())
      .then(setVendor)
      .catch(() => {})
  }, [username])

  if (!vendor) return null

  const bio = vendor.description || ''
  const listings = vendor.services || []
  const reviews = vendor.reviews || []

  return (
      <div className="max-w-screen-lg mx-auto mt-6 space-y-6 px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row">
              <img
                  src={vendor.profile_image || '/static/default_profile.jpg'}
                  alt={vendor.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto md:mx-0 md:mr-6"
              />
              <div className="flex-1 mt-4 md:mt-0">
                  <h1 className="text-2xl font-semibold text-gray-900">{vendor.name}</h1>
                  <p className="text-sm text-gray-500 mt-1">Joined in 2021</p>
                  <div className="flex flex-wrap items-center space-x-2 mt-2">
            <span className="flex items-center text-sm text-gray-700">
              <FaCheckCircle className="text-green-500 mr-1"/> Superhost
            </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                      <FaStar className="text-yellow-500"/>
                      <span className="text-sm font-medium">{vendor.rating}</span>
                  </div>
              </div>
          </div>

          {/* Verification Badge */}
          <div className="bg-gray-50 rounded-lg p-4 border flex items-center">
              <FaCheckCircle className="text-green-500 mr-2"/>
              <span className="text-sm text-gray-700">Identity verified in May 2019</span>
          </div>

          {/* About Section */}
          <div className="border rounded-lg bg-white p-6">
              <p className="text-gray-800 mb-4">
                  {showFullBio || bio.length < 200 ? bio : `${bio.slice(0, 200)}...`}
              </p>
              {!showFullBio && bio.length > 200 && (
                  <button className="text-blue-500" onClick={() => setShowFullBio(true)}>
                      Show more
                  </button>
              )}
              <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                      <span className="mr-2">🌍</span>
                      <span>From Johannesburg</span>
                  </div>
                  <div className="flex items-center">
                      <span className="mr-2">💬</span>
                      <span>Speaks English</span>
                  </div>
                  <div className="flex items-center">
                      <span className="mr-2">❤️</span>
                      <span>Travel, Photography</span>
                  </div>
              </div>
          </div>

          {/* Reviews Section */}
          <div>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                  {reviews.length === 0 && (
                      <p className="text-gray-600">No reviews yet.</p>
                  )}
                  {reviews.map((r) => (
                      <div key={r.id} className="bg-white border rounded-lg p-4 shadow-sm">
                          <div className="flex items-center mb-2">
                              <img
                                  src={r.user_avatar || '/static/default_profile.jpg'}
                                  alt="avatar"
                                  className="w-10 h-10 rounded-full mr-2"
                              />
                              <div>
                                  <p className="font-medium">{r.user}</p>
                                  <p className="text-sm text-gray-500">{r.date}</p>
                              </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                              <FaStar className="text-yellow-500 mr-1"/> {r.rating}
                          </div>
                          <p className="text-gray-700">{r.comment}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* Host Listings Section */}
          {listings.length > 0 && (
              <div>
                  <h2 className="text-xl font-semibold mb-4">
                      Places Hosted by {vendor.name}
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {listings.map((service) => (
                          <Link
                              to={`/services/${service.id}`}
                              key={service.id}
                              className="group block"
                          >
                              <img
                                  src={service.image}
                                  alt={service.name}
                                  className="rounded-lg shadow-sm mb-2 object-cover w-full h-48 group-hover:shadow-lg group-hover:scale-105 transition"
                              />
                              <h3 className="text-lg font-semibold">{service.name}</h3>
                              <div className="text-sm text-gray-500 flex items-center space-x-1">
                                  <FaStar className="text-yellow-500"/>
                                  <span>{service.rating}</span>
                                  <span>·</span>
                                  {service.price && <span>${service.price}</span>}
                              </div>
                          </Link>
                      ))}
                  </div>
              </div>
          )}
      </div>
  )
}