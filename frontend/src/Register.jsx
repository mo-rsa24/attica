import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext';
import atticaLogo from './assets/attica2.png';
import { AnimatePresence, motion } from 'framer-motion';

const roleOptions = [
  { value: 'EVENT_ORGANIZER', label: 'Event Organizer', icon: '🎪', description: 'Plan and manage events' },
  { value: 'ARTIST', label: 'Artist', icon: '🎨', description: 'Showcase your talent' },
  { value: 'SERVICE_PROVIDER', label: 'Service Provider', icon: '🛠', description: 'Offer your services' },
  { value: 'VENUE_MANAGER', label: 'Venue Manager', icon: '🏛', description: 'List your venues' },
  { value: 'TICKET_BUYER', label: 'Ticket Buyer', icon: '🎫', description: 'Discover events' },
];

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
    const ok = await register(username, email, password, roles)
    if (ok) {
      navigate('/')
    } else {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <motion.div
      className="min-h-screen flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Left pane: Image background */}
      <motion.div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden"
        initial={{ x: -36, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.12 }}
      >
        <img
          src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Event celebration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-pink-900/50" />

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/">
            <img src={atticaLogo} alt="Attica" className="h-10 w-auto brightness-0 invert" />
          </Link>

          <motion.div
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.24 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Where every event<br />finds its perfect team.
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-md">
              Join a marketplace of organizers, artists, vendors, and venues — all connected through Attica.
            </p>

            {/* Testimonial card */}
            <motion.div
              className="mt-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm border border-white/10"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.34 }}
            >
              <p className="text-white/90 text-sm leading-relaxed italic">
                "Attica made planning our corporate gala so effortless. We found amazing vendors and an incredible venue in just a few days."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-400/30 flex items-center justify-center text-sm font-bold text-white">
                  TM
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Thandi M.</p>
                  <p className="text-gray-400 text-xs">Event Organizer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right pane: Form */}
      <motion.div
        className="w-full lg:w-[55%] flex items-center justify-center bg-white px-6 py-12"
        initial={{ x: 36, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.12 }}
      >
        <motion.div
          className="w-full max-w-lg"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.18 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/">
              <img src={atticaLogo} alt="Attica" className="h-10 w-auto" />
            </Link>
          </div>

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.22 }}
          >
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Create your account
            </h1>
            <p className="mt-2 text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.26 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.34 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </motion.div>

            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.38 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to use Attica as a...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roleOptions.map((role, index) => {
                  const isSelected = roles.includes(role.value);
                  return (
                    <motion.button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        setRoles(prev =>
                          prev.includes(role.value)
                            ? prev.filter(r => r !== role.value)
                            : [...prev, role.value]
                        );
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200
                        ${isSelected
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut', delay: 0.42 + (index * 0.04) }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="text-xl flex-shrink-0">{role.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {role.label}
                        </p>
                        <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                          {role.description}
                        </p>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 ml-auto flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md mt-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.56 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Create account
            </motion.button>
          </form>

          <motion.p
            className="mt-6 text-xs text-gray-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.62 }}
          >
            By creating an account, you agree to Attica's Terms of Service and Privacy Policy.
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
