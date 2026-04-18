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

const KNOWN_STEPS = new Set(Object.values(stepPathLookup));

const resolveStepPath = (currentStep) => {
    if (!currentStep && currentStep !== 0) return null;
    const normalized = String(currentStep).toLowerCase();
    if (stepPathLookup[normalized]) return stepPathLookup[normalized];
    if (stepPathLookup[`step${normalized}`]) return stepPathLookup[`step${normalized}`];
    return null;
};

// Returns the step segment from a pathname like /listing/19/step3 or /listing/19/step3/location
const getUrlStep = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    // Walk from the end; the first known step segment wins
    for (let i = segments.length - 1; i >= 0; i--) {
        if (KNOWN_STEPS.has(segments[i])) return segments[i];
    }
    return null;
};

export default function ListingWizardLayout() {
    const {eventId} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const locationRef = useRef(location);
    useEffect(() => { locationRef.current = location; }, [location]);
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

            // If the URL already targets a recognized step, stay there.
            // Only redirect to the saved current_step when the URL has no step (index route).
            const urlStep = getUrlStep(locationRef.current.pathname);
            if (urlStep) {
                setIsLoading(false);
                return;
            }

            // No step in the URL — redirect to wherever the user left off.
            const stepPath = resolveStepPath(draft.current_step);
            if (stepPath) {
                navigate(`/listing/${eventId}/${stepPath}`, {replace: true});
                return;
            }

            setIsLoading(false);
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
