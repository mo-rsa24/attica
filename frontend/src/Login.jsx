import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import Footer from './Footer.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    const ok = await login(username, password)
    if (ok) {
      navigate('/')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-pink-50 to-white">
      {/* Main content area: two-column layout */}
      <div className="flex flex-1 my-10">
        {/* Left pane: form (65%) */}
        <div className="w-full md:w-[65%] flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center">Welcome Back</h2>
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
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button
                  type="submit"
                  className="w-full py-2 bg-pink-500 text-white font-semibold rounded-md hover:bg-pink-600 transition-colors"
              >
                Login
              </button>
            </form>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-pink-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right pane: HR image (35%) with margin */}
        <div className="hidden md:block w-[35%] relative mr-20">
          <img
              src="https://images.pexels.com/photos/29671943/pexels-photo-29671943.jpeg"
              alt="HR side"
              className="absolute inset-0 w-full h-full object-cover rounded-l-2xl"
          />
        </div>
      </div>
    </div>
  )
}
