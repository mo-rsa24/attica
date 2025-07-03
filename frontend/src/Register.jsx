import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import Footer from './Footer.jsx' // Assuming Footer.jsx is in the same folder

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState([])
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    // This backend logic remains unchanged
    const ok = await register(username, email, password, roles)
    if (ok) {
      navigate('/')
    } else {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-pink-50 to-white">
      {/* Main content area: two-column layout */}
      <div className="flex flex-1 my-5">
        {/* Left pane: form (65%) */}
        <div className="w-full md:w-[65%] flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center">Create Your Account</h2>
            {error && <p className="text-center text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                    id="username"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Choose a username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                    id="password"
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Select Your Role(s)</p>
                <div className="flex flex-wrap gap-3">
                  {['EVENT_ORGANIZER', 'ARTIST', 'SERVICE_PROVIDER', 'VENUE_MANAGER', 'TICKET_BUYER'].map(role => (
                      <button
                          key={role}
                          type="button" // Use type="button" to prevent form submission
                          onClick={() => {
                            const newRoles = roles.includes(role)
                                ? roles.filter(r => r !== role)
                                : [...roles, role];
                            setRoles(newRoles);
                          }}
                          className={`
          px-4 py-2 rounded-full cursor-pointer transition-colors duration-200 ease-in-out
          text-sm font-semibold border
          ${roles.includes(role)
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-pink-50 hover:border-pink-300'
                          }
        `}
                      >
                        {role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) /* Capitalize Each Word */}
                      </button>
                  ))}
                </div>
              </div>

              <button
                  type="submit"
                  className="w-full py-2 bg-pink-500 text-white font-semibold rounded-md hover:bg-pink-600 transition-colors"
              >
                Sign Up
              </button>
            </form>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-600 font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Right pane: Image (35%) */}
        <div className="hidden md:block w-[35%] relative mr-20">
          <img
              src="https://images.pexels.com/photos/26989918/pexels-photo-26989918.jpeg"
              alt="Decorative side"
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          />
        </div>
      </div>
    </div>
  )
}