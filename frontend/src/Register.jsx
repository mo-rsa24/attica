import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    const ok = await register(username, email, password)
    if (ok) {
      navigate('/')
    } else {
      setError('Registration failed')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">Register</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          className="border w-full p-2"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="border w-full p-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border w-full p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
          Register
        </button>
      </form>
    </div>
  )
}