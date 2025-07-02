import { useAuth } from './AuthProvider.jsx'

export default function Profile() {
  const { user } = useAuth()
  if (!user) return <p className="text-center mt-10">Loading...</p>
  return (
    <div className="max-w-md mx-auto mt-10 space-y-4 text-center">
      <img
        src={user.profile_picture || '/static/default_profile.jpg'}
        alt="profile"
        className="w-24 h-24 rounded-full mx-auto"
      />
      <p className="font-bold">{user.username}</p>
      <p>{user.email}</p>
    </div>
  )
}