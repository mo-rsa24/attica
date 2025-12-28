import React, {useEffect, useRef, useState} from 'react'
import {useParams, Link} from 'react-router-dom'
import {FaCheckCircle, FaPaperPlane, FaStar} from "react-icons/fa";

export default function VendorProfile() {
    const {username} = useParams()
    const [vendor, setVendor] = useState(null)
    const [showFullBio, setShowFullBio] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const messageListRef = useRef(null)

    useEffect(() => {
        fetch(`/api/vendors/by-username/${username}/`)
            .then((res) => res.json())
            .then(setVendor)
            .catch(() => {
            })
    }, [username])

    useEffect(() => {
        if (vendor && messages.length === 0) {
            setMessages([
                {id: 1, sender: 'vendor', text: `Hi, I'm ${vendor.name}. Thanks for reaching out!`, time: '09:20'},
                {
                    id: 2,
                    sender: 'me',
                    text: 'Hello! I love your portfolio. Are you available for a project next week?',
                    time: '09:24'
                },
                {
                    id: 3,
                    sender: 'vendor',
                    text: 'Absolutely—send me the details and I will share options.',
                    time: '09:27'
                },
            ])
        }
    }, [vendor, messages.length])

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight
        }
    }, [messages, isChatOpen])

    const handleSendMessage = (event) => {
        event.preventDefault()
        const trimmed = newMessage.trim()
        if (!trimmed) return

        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'me',
                text: trimmed,
                time,
            },
        ])
        setNewMessage('')
    }

    if (!vendor) return null

    const bio = vendor.description || ''
    const listings = vendor.services || []
    const reviews = vendor.reviews || []

    if (isChatOpen) {
        return (
            <div className="max-w-screen-lg mx-auto mt-6 space-y-4 px-4">
                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <img
                        src={vendor.profile_image || '/static/default_profile.jpg'}
                        alt={vendor.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Chatting with</p>
                        <h1 className="text-xl font-semibold text-gray-900">{vendor.name}</h1>
                    </div>
                    <button
                        onClick={() => setIsChatOpen(false)}
                        className="text-sm text-blue-600 font-medium"
                    >
                        Back to profile
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    <div
                        ref={messageListRef}
                        className="max-h-[26rem] overflow-y-auto p-4 space-y-3 bg-gray-50"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                                        message.sender === 'me'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-900 border rounded-bl-none'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                    <p className={`text-[11px] mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {message.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="border-t bg-white p-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 transition"
                            >
                                <FaPaperPlane/>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

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
                    <div className="flex items-start justify-between">
                      <div>
                          <h1 className="text-2xl font-semibold text-gray-900">{vendor.name}</h1>
                          <p className="text-sm text-gray-500 mt-1">Joined in 2021</p>
                      </div>
                      <button
                          onClick={() => setIsChatOpen(true)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-500 transition"
                      >
                          <FaPaperPlane />
                          DM
                      </button>
                  </div>
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