// Stage 4's model: a pure reducer over the fixed request-lifecycle sequence.
// Order is the lesson here, so this is deliberately not resolve()'s
// memoryless shape. Every code string below is copied verbatim from the real
// files in this repo (re-read the day this scene was built); nothing is
// paraphrased.
//
// save clicked -> proxy-forwarded -> view received -> serializer validated
// -> row written -> response sent -> React re-rendered

export type LifecycleSide = 'frontend' | 'network' | 'backend'
export type Breakpoint = 'frontend' | 'backend'

export interface CodePanel {
  file: string
  lang: string
  code: string
  /** 1-indexed lines within `code` to highlight for this step */
  activeLines: number[]
}

export interface LifecycleStep {
  id: string
  index: number
  title: string
  side: LifecycleSide
  note: string
  panels: CodePanel[]
  stack: string[]
  /** which armed breakpoint, if any, would actually stop execution at this step */
  breakpointFires: Breakpoint | null
}

const LISTING_STEP1_SNIPPET = `        setIsSaving(true);

        const startDateTime = formData.startDate ? \`\${formData.startDate}T\${formData.startTime || '00:00'}\` : null;
        const nextStep = destination === 'continue' ? getNextStep('step1') : undefined;
        const payload = {
            name: formData.eventName,
            category: formData.selectedEventType,
            theme: formData.theme,
            guest_count: formData.capacity ? Number(formData.capacity) : null,
            start_date: startDateTime,
            end_date: formData.endDate || null,
            start_time: startDateTime,
            end_time: formData.endTime || null,
            date: formData.startDate || null,
            notes: [formData.description, formData.additionalNotes].filter(Boolean).join('\\n\\n'),
        };

        const result = await saveStep(eventId, 'step1', payload, nextStep);
        setIsSaving(false);`

const SAVE_STEP_SNIPPET = `    const saveStep = useCallback(async (id, step, payload, nextStep) => {
        const normalizedStep = step || state.current_step;
        const sanitizedPayload = sanitizePayload(payload);
        const filteredPayload = filterPayloadForStep(normalizedStep, sanitizedPayload);
        const eventId = id || state.event?.id;

        const mergedSteps = mergeStepMaps(state.data.steps, { [normalizedStep]: sanitizedPayload });
        const mergedData = applyStepsToData({ ...state.data, steps: mergedSteps }, mergedSteps);

        dispatch({ type: 'setSaving', payload: true });
        dispatch({ type: 'mergeStepData', step: normalizedStep, payload: sanitizedPayload });

        const body = {
            data: { ...mergedData, steps: mergedSteps },
            current_step: nextStep || normalizedStep,
        };

        const endpoint = eventId ? \`/api/events/event-drafts/\${eventId}/\` : '/api/events/event-drafts/';
        const method = eventId ? 'PATCH' : 'POST';

        try {
            const response = await authFetch(endpoint, {
                method,
                body: JSON.stringify(body),
            });`

const VITE_PROXY_SNIPPET = `    proxy: {
      '/api': 'http://localhost:8000',
      '/vendors': 'http://localhost:8000',
      '/cart': 'http://localhost:8000',
      '/checkout': 'http://localhost:8000',
      '/ws': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },`

const VIEW_RECEIVED_SNIPPET = `    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user:
            return Response({"detail": "You do not have permission to edit this event."}, status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop('partial', True)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)`

const SERIALIZER_VALIDATED_SNIPPET = `        partial = kwargs.pop('partial', True)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Merge data payloads if provided
        incoming_data = serializer.validated_data.get("data")
        if incoming_data is not None:
            serializer.validated_data["data"] = {**(instance.data or {}), **incoming_data}
        if not serializer.validated_data.get("current_step"):
            serializer.validated_data["current_step"] = instance.current_step`

const ROW_WRITTEN_SNIPPET = `        if not serializer.validated_data.get("current_step"):
            serializer.validated_data["current_step"] = instance.current_step
        serializer.save()
        return Response(serializer.data)`

const RESPONSE_SENT_SNIPPET = `        serializer.save()
        return Response(serializer.data)`

const REACT_RERENDER_SNIPPET = `            const savedDraft = await response.json();
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
            });`

export const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    id: 'save-clicked',
    index: 0,
    title: 'save clicked',
    side: 'frontend',
    note: "ListingStep1.jsx's submit handler builds the PATCH payload and calls saveStep(), which normalizes it and calls authFetch. This is the frontend breakpoint site.",
    panels: [
      { file: 'frontend/src/ListingStep1.jsx', lang: 'javascript', code: LISTING_STEP1_SNIPPET, activeLines: [17] },
      { file: 'frontend/src/context/reactContext.jsx', lang: 'javascript', code: SAVE_STEP_SNIPPET, activeLines: [1] },
    ],
    stack: ['handleSaveAndContinue (ListingStep1.jsx:217)', 'saveStep (reactContext.jsx:404)', 'React onClick handler', 'browser event loop'],
    breakpointFires: 'frontend',
  },
  {
    id: 'proxy-forwarded',
    index: 1,
    title: 'proxy-forwarded',
    side: 'network',
    note: "authFetch hits '/api/events/event-drafts/<id>/' on :5173. Vite's dev-server proxy matches the '/api' entry and forwards the request to :8000 unchanged, no CORS handling needed because the browser only ever sees one origin.",
    panels: [{ file: 'frontend/vite.config.js', lang: 'javascript', code: VITE_PROXY_SNIPPET, activeLines: [2] }],
    stack: ['Vite dev server: http-proxy middleware', "matched rule: '/api' -> http://localhost:8000"],
    breakpointFires: null,
  },
  {
    id: 'view-received',
    index: 2,
    title: 'view received',
    side: 'backend',
    note: 'Django/DRF resolves the URL to EventDraftViewSet.partial_update, checks ownership, then hands off to the serializer. This is the backend breakpoint site.',
    panels: [{ file: 'backend/main/events/views.py', lang: 'python', code: VIEW_RECEIVED_SNIPPET, activeLines: [1] }],
    stack: ['EventDraftViewSet.partial_update (views.py:281)', 'ViewSetMixin.dispatch', 'URLResolver.resolve', 'ASGIHandler (Daphne) / WSGIHandler (runserver)'],
    breakpointFires: 'backend',
  },
  {
    id: 'serializer-validated',
    index: 3,
    title: 'serializer validated',
    side: 'backend',
    note: 'serializer.is_valid(raise_exception=True) runs field validation, then the two data dicts (the row already in the database and the incoming patch) are merged by hand before save.',
    panels: [{ file: 'backend/main/events/views.py', lang: 'python', code: SERIALIZER_VALIDATED_SNIPPET, activeLines: [3] }],
    stack: ['EventDraftSerializer.is_valid', 'EventDraftViewSet.partial_update (views.py:288-295)'],
    breakpointFires: null,
  },
  {
    id: 'row-written',
    index: 4,
    title: 'row written',
    side: 'backend',
    note: 'serializer.save() calls the model manager and issues the actual UPDATE against the EventDraft row.',
    panels: [{ file: 'backend/main/events/views.py', lang: 'python', code: ROW_WRITTEN_SNIPPET, activeLines: [3] }],
    stack: ['EventDraftSerializer.save', 'Model.save', 'django.db.backends... UPDATE'],
    breakpointFires: null,
  },
  {
    id: 'response-sent',
    index: 5,
    title: 'response sent',
    side: 'backend',
    note: 'The saved row is re-serialized and wrapped in a DRF Response, which becomes the HTTP 200 body Vite proxies back unchanged.',
    panels: [{ file: 'backend/main/events/views.py', lang: 'python', code: RESPONSE_SENT_SNIPPET, activeLines: [2] }],
    stack: ['EventDraftViewSet.partial_update (views.py:297)', 'DRF Response -> ASGI/WSGI response cycle'],
    breakpointFires: null,
  },
  {
    id: 'react-rerendered',
    index: 6,
    title: 'React re-rendered',
    side: 'frontend',
    note: "Back in saveStep, the JSON body becomes the new store state via dispatch({type:'hydrate', ...}), and every component reading that context re-renders with the saved draft.",
    panels: [{ file: 'frontend/src/context/reactContext.jsx', lang: 'javascript', code: REACT_RERENDER_SNIPPET, activeLines: [7] }],
    stack: ['saveStep (reactContext.jsx:438)', 'dispatch (React useReducer)', 'ListingStep1 re-render'],
    breakpointFires: null,
  },
]

export function lifecycleAt(playhead: number): LifecycleStep {
  const i = Math.max(0, Math.min(playhead, LIFECYCLE_STEPS.length - 1))
  return LIFECYCLE_STEPS[i]
}

export interface BreakpointHit {
  which: Breakpoint
  atIndex: number
  step: LifecycleStep
}

/** Which armed breakpoint fires first, walking the fixed sequence in order. */
export function firstBreakpointHit(armed: { frontend: boolean; backend: boolean }): BreakpointHit | null {
  for (const step of LIFECYCLE_STEPS) {
    if (step.breakpointFires === 'frontend' && armed.frontend) return { which: 'frontend', atIndex: step.index, step }
    if (step.breakpointFires === 'backend' && armed.backend) return { which: 'backend', atIndex: step.index, step }
  }
  return null
}

/** Every breakpoint that would fire, in the order they fire, for the "step both call stacks in sync" proof. */
export function allBreakpointHits(armed: { frontend: boolean; backend: boolean }): BreakpointHit[] {
  const out: BreakpointHit[] = []
  for (const step of LIFECYCLE_STEPS) {
    if (step.breakpointFires === 'frontend' && armed.frontend) out.push({ which: 'frontend', atIndex: step.index, step })
    if (step.breakpointFires === 'backend' && armed.backend) out.push({ which: 'backend', atIndex: step.index, step })
  }
  return out
}
