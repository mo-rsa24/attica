import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer
} from 'react';
import { useAuth } from '../AuthContext';
const LOCAL_STORAGE_KEY = 'eventCreationStore';
const STEP_SEQUENCE = ['step1', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'review'];

const initialState = {
    event: null,
    data: {
        steps: {},
        selectedLocations: [],
        selectedArtists: [],
        selectedVendors: [],
        eventDetails: {},
    },
    status: 'idle',
    current_step: 'step1',
    loading: false,
    saving: false,
    error: null,
};

const STEP_VALIDATORS = {
    step1: (data) => Boolean(
        data?.steps?.step1?.eventName ||
        data?.steps?.step1?.name ||
        data?.eventDetails?.eventName ||
        data?.event?.name
    ),
    step3: (data) => (data?.selectedLocations?.length || data?.steps?.step3?.selectedLocations?.length),
    step4: (data) => Boolean(data?.eventDetails?.location || data?.steps?.step4?.location),
    step5: (data) => Boolean(data?.steps?.step5),
};

const STEP_FIELD_WHITELIST = {
    step1: ['name', 'notes', 'category', 'theme', 'start_date', 'end_date', 'start_time', 'end_time', 'guest_count', 'date'],
    step3: ['location'],
    step4: ['location'],
    step5: ['budget', 'guest_count'],
    step6: ['base_price', 'currency', 'tiered_prices'],
    step7: ['refund_policy', 'access_type', 'is_age_restricted', 'custom_questions'],
    step8: ['image_url', 'banner_image'],
};

const mergeStepMaps = (...maps) => maps.reduce((acc, map) => {
    if (!map) return acc;
    Object.entries(map).forEach(([step, payload]) => {
        acc[step] = { ...(acc[step] || {}), ...payload };
    });
    return acc;
}, {});

const deriveDataFromStepPayload = (data, step, payload) => {
    const nextData = { ...data };
    if (Array.isArray(payload?.selectedLocations)) {
        nextData.selectedLocations = payload.selectedLocations;
    }
    if (Array.isArray(payload?.selectedArtists)) {
        nextData.selectedArtists = payload.selectedArtists;
    }
    if (Array.isArray(payload?.selectedVendors)) {
        nextData.selectedVendors = payload.selectedVendors;
    }
    if (payload?.eventDetails || step === 'step4') {
        nextData.eventDetails = { ...data.eventDetails, ...(payload?.eventDetails || {}), ...(payload?.location ? { location: payload.location } : {}) };
    }
    return nextData;
};

const applyStepsToData = (data, steps) => {
    const nextData = { ...data, steps };
    const step3 = steps.step3 || {};
    const step4 = steps.step4 || {};
    if (Array.isArray(step3.selectedLocations)) {
        nextData.selectedLocations = step3.selectedLocations;
    }
    if (Array.isArray(step3.selectedArtists)) {
        nextData.selectedArtists = step3.selectedArtists;
    }
    if (Array.isArray(step3.selectedVendors)) {
        nextData.selectedVendors = step3.selectedVendors;
    }
    if (step4.eventDetails || step4.location) {
        nextData.eventDetails = { ...nextData.eventDetails, ...step4.eventDetails, ...(step4.location ? { location: step4.location } : {}) };
    }
    return nextData;
};

const sanitizePayload = (payload) => JSON.parse(JSON.stringify(payload, (key, value) => {
    const isFile = typeof File !== 'undefined' && value instanceof File;
    if (isFile) return undefined;
    if (value?.preview) return undefined;
    return value;
}));

const filterPayloadForStep = (step, payload) => {
    const allowedFields = STEP_FIELD_WHITELIST[step];
    if (!allowedFields) return payload;
    return Object.entries(payload || {}).reduce((acc, [key, value]) => {
        if (allowedFields.includes(key) && value !== undefined && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {});
};



const loadPersistedState = () => {
    try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!cached) return initialState;
        const parsed = JSON.parse(cached);
        return {...initialState, ...parsed, loading: false, saving: false, error: null};
    } catch (error) {
        console.error('Failed to load cached event creation state', error);
        return initialState;
    }
};

const eventCreationReducer = (state, action) => {
    switch (action.type) {
    case 'hydrate':
        return {
            ...state,
            ...action.payload,
            loading: false,
            saving: false,
            error: null,
        };
    case 'setLoading':
        return { ...state, loading: action.payload };
    case 'setSaving':
        return { ...state, saving: action.payload };
    case 'setError':
        return { ...state, error: action.payload };
    case 'setStatus':
        return { ...state, status: action.payload };
    case 'setCurrentStep':
        return { ...state, current_step: action.payload };
    case 'setEvent':
        return { ...state, event: action.payload };
    case 'mergeStepData': {
        const mergedSteps = mergeStepMaps(state.data.steps, { [action.step]: action.payload });
        const mergedData = applyStepsToData(
            deriveDataFromStepPayload(state.data, action.step, action.payload),
            mergedSteps,
        );
        return { ...state, data: mergedData };
    }
    default:
        return state;
    }
};

const EventCreationContext = createContext();

export const useEventCreation = () => useContext(EventCreationContext);
// 3. Create the Provider component
export const EventCreationProvider = ({ children }) => {
    const { tokens } = useAuth();
    const [state, dispatch] = useReducer(eventCreationReducer, initialState, loadPersistedState);

    useEffect(() => {
        const toCache = sanitizePayload({
            ...state,
            loading: false,
            saving: false,
            error: null,
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toCache));
    }, [state]);

    const authFetch = useCallback((url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (tokens?.access) {
            headers.Authorization = `Bearer ${tokens.access}`;
        }
        return fetch(url, { ...options, headers });
    }, [tokens]);

    const setCurrentStep = useCallback((step) => {
        dispatch({ type: 'setCurrentStep', payload: step });
    }, []);

    const getNextStep = useCallback((step = state.current_step) => {
        const index = STEP_SEQUENCE.indexOf(step);
        if (index === -1) return step;
        return STEP_SEQUENCE[Math.min(index + 1, STEP_SEQUENCE.length - 1)];
    }, [state.current_step]);

    const getPreviousStep = useCallback((step = state.current_step) => {
        const index = STEP_SEQUENCE.indexOf(step);
        if (index <= 0) return STEP_SEQUENCE[0];
        return STEP_SEQUENCE[index - 1];
    }, [state.current_step]);

    const getStepData = useCallback((step, defaults = {}) => {
        const backendSteps = state.event?.data?.steps || {};
        return {
            ...defaults,
            ...(backendSteps[step] || {}),
            ...(state.data.steps?.[step] || {}),
        };
    }, [state.data.steps, state.event]);

    const setStepData = useCallback((step, payload) => {
        dispatch({ type: 'mergeStepData', step, payload: sanitizePayload(payload) });
    }, []);

    const selectedLocations = useMemo(
        () => state.data.selectedLocations
            || state.data.steps?.step3?.selectedLocations
            || state.event?.data?.selectedLocations
            || state.event?.data?.steps?.step3?.selectedLocations
            || [],
        [state.data.selectedLocations, state.data.steps, state.event],
    );
    const selectedArtists = useMemo(
        () => state.data.selectedArtists
            || state.data.steps?.step3?.selectedArtists
            || state.event?.data?.selectedArtists
            || state.event?.data?.steps?.step3?.selectedArtists
            || [],
        [state.data.selectedArtists, state.data.steps, state.event],
    );
    const selectedVendors = useMemo(
        () => state.data.selectedVendors
            || state.data.steps?.step3?.selectedVendors
            || state.event?.data?.selectedVendors
            || state.event?.data?.steps?.step3?.selectedVendors
            || [],
        [state.data.selectedVendors, state.data.steps, state.event],
    );
    const eventDetails = useMemo(
        () => state.data.eventDetails
            || state.data.steps?.step4?.eventDetails
            || state.event?.data?.eventDetails
            || state.event?.data?.steps?.step4?.eventDetails
            || {},
        [state.data.eventDetails, state.data.steps, state.event],
    );

    const setSelectedLocations = useCallback(
        (payload) => setStepData('step3', { selectedLocations: payload }),
        [setStepData],
    );
    const setSelectedArtists = useCallback(
        (payload) => setStepData('step3', { selectedArtists: payload }),
        [setStepData],
    );
    const setSelectedVendors = useCallback(
        (payload) => setStepData('step3', { selectedVendors: payload }),
        [setStepData],
    );
    const setEventDetails = useCallback(
        (payload) => setStepData('step4', { eventDetails: payload }),
        [setStepData],
    );

    const loadEvent = useCallback(async (id) => {
        if (!id) return null;
        dispatch({ type: 'setLoading', payload: true });
        try {
            const response = await authFetch(`/api/events/event-drafts/${id}/`);
            if (!response.ok) {
                throw new Error('Failed to load event from the server.');
            }
            const payload = await response.json();
            const backendSteps = payload?.data?.steps || {};
            const mergedSteps = mergeStepMaps(
                backendSteps(payload),
                state.data.steps,
            );
            const mergedData = applyStepsToData(
                { ...state.data, ...(payload.data || {}), steps: mergedSteps },
                mergedSteps,
            );
            dispatch({
                type: 'hydrate',
                payload: {
                    event: payload,
                    data: mergedData,
                    status: payload.status || 'draft',
                    current_step: payload.current_step || state.current_step,
                },
            });
            return payload;
        } catch (error) {
            console.error(error);
            dispatch({ type: 'setError', payload: 'Unable to reach the server. Using cached data instead.' });
            return null
        } finally {
            dispatch({ type: 'setLoading', payload: false });
        }
    }, [authFetch, state.current_step, state.data]);

    const saveStep = useCallback(async (id, step, payload, nextStep) => {
        const normalizedStep = step || state.current_step;
        const sanitizedPayload = sanitizePayload(payload);
        const filteredPayload = filterPayloadForStep(normalizedStep, sanitizedPayload);
        const eventId = id || state.event?.id;

        const mergedSteps = mergeStepMaps(state.data.steps, { [normalizedStep]: sanitizedPayload });
        const mergedData = applyStepsToData({ ...state.data, steps: mergedSteps }, mergedSteps);

        dispatch({ type: 'setSaving', payload: true });
        dispatch({ type: 'mergeStepData', step: normalizedStep, payload: sanitizedPayload });

        const body = {
            data: { ...mergedData, ...((filteredPayload && Object.keys(filteredPayload).length) ? { steps: mergedSteps } : { steps: mergedSteps }) },
            current_step: nextStep || normalizedStep,
        };

        const endpoint = eventId ? `/api/events/event-drafts/${eventId}/` : '/api/events/event-drafts/';
        const method = eventId ? 'PATCH' : 'POST';

        try {
            const response = await authFetch(endpoint, {
                method,
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error('Failed to save step to the server.');
            }
            const savedDraft = await response.json();
            const savedSteps = savedDraft?.data?.steps || mergedSteps;
            const updatedData = applyStepsToData(
                { ...mergedData, ...(savedDraft.data || {}), steps: savedSteps },
                savedSteps,
            );
            dispatch({
                type: 'hydrate',
                payload: {
                    event: savedDraft,
                    data: updatedData,
                    status: savedDraft.status || state.status,
                    current_step: savedDraft.current_step || nextStep || normalizedStep,
                },
            });
            if (nextStep) {
                dispatch({ type: 'setCurrentStep', payload: nextStep });
            }
            return { ok: true, data: savedDraft };
        } catch (error) {
            console.error(error);
            dispatch({ type: 'setError', payload: 'Save failed, stored locally until you are back online.' });
            dispatch({ type: 'setStatus', payload: 'offline-draft' });
            return { ok: false, error: error.message };
        } finally {
            dispatch({ type: 'setSaving', payload: false });
        }
    }, [authFetch, state.current_step, state.data, state.event, state.status]);

    const saveAndExit = useCallback(async (id) => {
        const activeStep = state.current_step;
        const cachedStepPayload = state.data.steps?.[activeStep] || {};
        const result = await saveStep(id, activeStep, cachedStepPayload);
        dispatch({ type: 'setStatus', payload: result.ok ? 'saved' : state.status });
        return result;
    }, [saveStep, state.current_step, state.data.steps, state.status]);

    const publish = useCallback(async (id) => {
        const eventId = id || state.event?.id;
        if (!eventId) {
            dispatch({ type: 'setError', payload: 'No event to publish. Save a draft first.' });
            return false;
        }
        dispatch({ type: 'setSaving', payload: true });
        try {
            const response = await authFetch(`/api/events/event-drafts/${eventId}/publish/`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to publish the event.');
            }
            const savedDraft = await response.json();
            const savedSteps = savedDraft?.data?.steps || state.data.steps;
            const updatedData = applyStepsToData(
                { ...state.data, ...(savedDraft.data || {}), steps: savedSteps },
                savedSteps,
            );
            dispatch({
                type: 'hydrate',
                payload: {
                    event: savedDraft,
                    data: updatedData,
                    status: savedDraft.status || 'published',
                    current_step: savedDraft.current_step || state.current_step,
                },
            });
            return true;
        } catch (error) {
            console.error(error);
            dispatch({ type: 'setError', payload: 'Publishing failed. Draft saved locally.' });
            dispatch({ type: 'setStatus', payload: 'draft' });
            return false;
        } finally {
            dispatch({ type: 'setSaving', payload: false });
        }
    }, [authFetch, state.current_step, state.data, state.event]);

    const isStepValid = useCallback((step = state.current_step) => {
        const validator = STEP_VALIDATORS[step];
        if (!validator) return true;
        return validator({ ...state.data, ...(state.event?.data || {}), event: state.event });
    }, [state.data, state.current_step, state.event]);


    const value = {
        event: state.event,
        data: state.data,
        status: state.status,
        current_step: state.current_step,
        loading: state.loading,
        saving: state.saving,
        error: state.error,
        selectedLocations,
        setSelectedLocations,
        selectedArtists,
        setSelectedArtists,
        selectedVendors,
        setSelectedVendors,
        eventDetails,
        setEventDetails,
        getStepData,
        setStepData,
        loadEvent,
        saveStep,
        saveAndExit,
        publish,
        isStepValid,
        getNextStep,
        getPreviousStep,
        setCurrentStep,
    };

    return (
        <EventCreationContext.Provider value={value}>
            {children}
        </EventCreationContext.Provider>
    );
};
