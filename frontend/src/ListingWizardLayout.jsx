import React, {useEffect, useRef, useState} from 'react';
import {Navigate, Outlet, useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from './AuthContext';
import {useEventCreation} from './context/reactContext.jsx';

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
    const {eventId} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {tokens} = useAuth();
    const {event, loadEvent} = useEventCreation();
    const [isLoading, setIsLoading] = useState(true);
    const loadEventRef = useRef(loadEvent);
    useEffect(() => { loadEventRef.current = loadEvent; }, [loadEvent]);

    useEffect(() => {
        if (!eventId) {
            navigate('/createEvent', {replace: true});
            return;
        }

        if (!tokens) {
            navigate('/login');
            return;
        }

        let isMounted = true;
        const fetchEvent = async () => {
            setIsLoading(true);
            const draft = await loadEventRef.current(eventId);
            if (!isMounted) return;
            if (!draft) {
                navigate('/createEvent', {replace: true});
                return;
            }
            const stepPath = resolveStepPath(draft.current_step);
            if (stepPath) {
                const targetPath = `/listing/${eventId}/${stepPath}`;
                if (!location.pathname.startsWith(targetPath)) {
                    navigate(targetPath, {replace: true});
                    return;
                }
                setIsLoading(false);
            }
        };

        fetchEvent();
        return () => {
            isMounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, tokens, navigate]);

    if (!eventId) {
        return <Navigate to="/createEvent" replace/>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-700">
                Loading your event...
            </div>
        );
    }

    return <Outlet context={{event, eventId}}/>;
}