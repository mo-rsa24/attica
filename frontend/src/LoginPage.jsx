import { useEffect } from 'react'

function LoginPage() {
  useEffect(() => {
    window.location.href = '/accounts/login/'
  }, [])
  return <p className="text-center mt-10">Redirecting to login...</p>
}

export default LoginPage