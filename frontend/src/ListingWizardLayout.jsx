import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import useAxios from './utils/useAxios';

const stepPathLookup = {
    '1': 'step1',
    '2': 'step2',
    '3': 'step3',
    '4': 'step4',
    '5': 'step5',
    '6': 'step6',
    '7': 'step7',
    '8': 'step8',
    step1: 'step1',
    step2: 'step2',
    step3: 'step3',
    step4: 'step4',
    step5: 'step5',
    step6: 'step6',
    step7: 'step7',
    step8: 'step8',
    review: 'review'
};

const resolveStepPath = (currentStep) => {
    if (!currentStep && currentStep !== 0) return null;
    const normalized = String(currentStep).toLowerCase();
    if (stepPathLookup[normalized]) return stepPathLookup[normalized];
    if (stepPathLookup[`step${normalized}`]) return stepPathLookup[`step${normalized}`];
    return null;
};

export default function ListingWizardLayout() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const api = useMemo(() => useAxios(), []);
    const { tokens } = useAuth();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!eventId) {
            navigate('/createEvent', { replace: true });
            return;
        }

        if (!tokens) {
            navigate('/login');
            return;
        }

        let isMounted = true;
        const fetchEvent = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/api/events/events/${eventId}/`);
                if (!isMounted) return;
                setEvent(response.data);
                const stepPath = resolveStepPath(response.data.current_step);
                if (stepPath) {
                    const targetPath = `/listing/${eventId}/${stepPath}`;
                    if (!location.pathname.startsWith(targetPath)) {
                        navigate(targetPath, { replace: true });
                        return;
                    }
                }
            } catch (error) {
                if (!isMounted) return;
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    navigate('/my-events', { replace: true });
                    return;
                }
                if (status === 404) {
                    navigate('/createEvent', { replace: true });
                    return;
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchEvent();
        return () => { isMounted = false; };
    }, [api, eventId, location.pathname, navigate, tokens]);

    if (!eventId) {
        return <Navigate to="/createEvent" replace />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-700">
                Loading your event...
            </div>
        );
    }

    return <Outlet context={{ event, eventId }} />;
}