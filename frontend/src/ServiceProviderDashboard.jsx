import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServiceProviderDashboard() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/provider-dashboard', { replace: true }); }, [navigate]);
  return null;
}
