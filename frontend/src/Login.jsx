import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext';
import atticaLogo from './assets/attica2.png';
import { AnimatePresence, motion } from 'framer-motion';

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
          src="https://images.pexels.com/photos/29671943/pexels-photo-29671943.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Event atmosphere"
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
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome back.<br />Your events await.
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-md">
              Pick up right where you left off — manage your events, connect with vendors, and bring your vision to life.
            </p>
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
          className="w-full max-w-md"
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
              Log in to Attica
            </h1>
            <p className="mt-2 text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-gray-900 font-semibold hover:underline">
                Sign up
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
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </motion.div>

            <motion.button
              type="submit"
              className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.34 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Log in
            </motion.button>
          </form>

          <motion.p
            className="mt-6 text-xs text-gray-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.4 }}
          >
            By logging in, you agree to Attica's Terms of Service and Privacy Policy.
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
