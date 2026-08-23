// Verbatim excerpts from Attica. Nothing paraphrased or tidied.
// `firstLine` is the real line number, so the header matches the file you open.

export interface Snippet {
  id: string
  file: string
  firstLine: number
  lang: 'python' | 'javascript'
  text: string
}

export const SNIPPETS: Record<string, Snippet> = {
  sequence: {
    id: 'sequence',
    file: 'frontend/src/context/reactContext.jsx',
    firstLine: 12,
    lang: 'javascript',
    text: `const LOCAL_STORAGE_KEY = 'eventCreationStore';
const STEP_SEQUENCE = ['step1', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'review'];

/**
 * Returns the wizard progress as a percentage (0–100) for the given step key.
 * All step components import this to render a consistent progress bar.
 */
export function getStepProgress(step) {
    const idx = STEP_SEQUENCE.indexOf(step);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / STEP_SEQUENCE.length) * 100);
}`,
  },

  nextStep: {
    id: 'nextStep',
    file: 'frontend/src/context/reactContext.jsx',
    firstLine: 213,
    lang: 'javascript',
    text: `    const getNextStep = useCallback((step = state.current_step) => {
        const index = STEP_SEQUENCE.indexOf(step);
        if (index === -1) return step;
        return STEP_SEQUENCE[Math.min(index + 1, STEP_SEQUENCE.length - 1)];
    }, [state.current_step]);`,
  },

  routes: {
    id: 'routes',
    file: 'frontend/src/App.jsx',
    firstLine: 119,
    lang: 'javascript',
    text: `                    <Route path="/listing/:eventId" element={<ListingWizardLayout/>}>
                        <Route path="step1" element={<ListingStep1/>}/>
                        <Route path="step2" element={<Navigate to="step1" replace/>}/>
                        <Route path="step3" element={<ListingStep3/>}/>`,
  },

  step2next: {
    id: 'step2next',
    file: 'frontend/src/ListingStep2.jsx',
    firstLine: 113,
    lang: 'javascript',
    text: `            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                 <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button onClick={() => navigate(\`\${listingBase}/step1\`)} className="font-bold text-gray-800 underline hover:text-black transition">
                        Back
                    </button>
                    <motion.button
                        onClick={() => navigate(\`\${listingBase}/step3\`)}`,
  },

  create: {
    id: 'create',
    file: 'frontend/src/CreateEventPage.jsx',
    firstLine: 59,
    lang: 'javascript',
    text: `            const response = await api.post('/api/events/event-drafts/', {
                data: { steps: {} },
                current_step: 'step1',
            });
            const newEventId = response.data?.id;
            if (newEventId) {
                navigate(\`/listing/\${newEventId}/step1\`, { replace: true });`,
  },

  model: {
    id: 'model',
    file: 'backend/main/events/models.py',
    firstLine: 99,
    lang: 'python',
    text: `class EventDraft(models.Model):
    """
    Organizer-managed event workflow draft.
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_drafts",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    current_step = models.CharField(max_length=100)
    data = models.JSONField(default=dict, blank=True)`,
  },

  saveStep: {
    id: 'saveStep',
    file: 'frontend/src/context/reactContext.jsx',
    firstLine: 404,
    lang: 'javascript',
    text: `    const saveStep = useCallback(async (id, step, payload, nextStep) => {
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

        const endpoint = eventId ? \`/api/events/event-drafts/\${eventId}/\` : '/api/events/event-drafts/';
        const method = eventId ? 'PATCH' : 'POST';`,
  },

  whitelist: {
    id: 'whitelist',
    file: 'frontend/src/context/reactContext.jsx',
    firstLine: 53,
    lang: 'javascript',
    text: `const STEP_FIELD_WHITELIST = {
    step1: ['name', 'notes', 'category', 'theme', 'start_date', 'end_date', 'start_time', 'end_time', 'guest_count', 'date'],
    step3: ['location', 'bookingRequestIds'],
    step4: ['location'],
    step5: ['budget', 'guest_count'],
    step6: ['base_price', 'currency', 'tiered_prices'],
    step7: ['refund_policy', 'access_type', 'is_age_restricted', 'custom_questions'],
    step8: ['image_url', 'banner_image'],
};`,
  },

  sanitize: {
    id: 'sanitize',
    file: 'frontend/src/context/reactContext.jsx',
    firstLine: 107,
    lang: 'javascript',
    text: `const sanitizePayload = (payload) => JSON.parse(JSON.stringify(payload, (key, value) => {
    if (typeof File !== 'undefined' && value instanceof File) return undefined;
    if (typeof Blob !== 'undefined' && value instanceof Blob) return undefined;
    if (typeof value === 'string' && value.startsWith('blob:')) return undefined;
    return value;
}));`,
  },

  persist: {
    id: 'persist',
    file: 'frontend/src/context/reactContext.jsx',
    firstLine: 185,
    lang: 'javascript',
    text: `    useEffect(() => {
        const toCache = sanitizePayload({
            ...state,
            loading: false,
            saving: false,
            error: null,
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toCache));
    }, [state]);`,
  },

  merge: {
    id: 'merge',
    file: 'frontend/src/context/reactContext.jsx',
    firstLine: 314,
    lang: 'javascript',
    text: `            const payload = await response.json();
            const currentState = stateRef.current;
            const backendSteps = payload?.data?.steps || {};
            const mergedSteps = mergeStepMaps(
                backendSteps,
                currentState.data.steps,
            );`,
  },

  layout: {
    id: 'layout',
    file: 'frontend/src/ListingWizardLayout.jsx',
    firstLine: 79,
    lang: 'javascript',
    text: `            // If the URL already targets a recognized step, stay there.
            // Only redirect to the saved current_step when the URL has no step (index route).
            const urlStep = getUrlStep(locationRef.current.pathname);
            if (urlStep) {
                setIsLoading(false);
                return;
            }

            // No step in the URL — redirect to wherever the user left off.
            const stepPath = resolveStepPath(draft.current_step);
            if (stepPath) {
                navigate(\`/listing/\${eventId}/\${stepPath}\`, {replace: true});
                return;
            }

            setIsLoading(false);`,
  },

  step3write: {
    id: 'step3write',
    file: 'frontend/src/ListingStep3.jsx',
    firstLine: 167,
    lang: 'javascript',
    text: `    const step1 = getStepData('step1', {});
    const nextSchedule = {
      startDate: dayjs(selectedRange.start).format('YYYY-MM-DD'),
      startTime: dayjs(selectedRange.start).format('HH:mm'),
      endDate: dayjs(selectedRange.end).format('YYYY-MM-DD'),
      endTime: dayjs(selectedRange.end).format('HH:mm'),
      date: dayjs(selectedRange.start).format('YYYY-MM-DD'),
      start_date: selectedRange.start.toISOString(),
      start_time: dayjs(selectedRange.start).format('HH:mm'),
      end_date: selectedRange.end.toISOString(),
      end_time: dayjs(selectedRange.end).format('HH:mm'),
    };

    const isAlreadySynced = Object.entries(nextSchedule).every(([key, value]) => step1?.[key] === value);
    if (!isAlreadySynced) {
      setStepData('step1', { ...step1, ...nextSchedule });
    }`,
  },

  projection: {
    id: 'projection',
    file: 'backend/main/events/views.py',
    firstLine: 384,
    lang: 'python',
    text: `        event_payload = {
            "location": location,
            "name": self._first_truthy(step1.get("name"), step1.get("eventName"), payload.get("name"), payload.get("eventName"), "Untitled event"),
            "date": event_date,
            "start_date": start_dt,
            "end_date": end_dt.date() if end_dt else None,
            "start_time": start_dt or timezone.now(),
            "end_time": parsed_end_time,
            "budget": self._first_truthy(step5.get("budget"), payload.get("budget")),
            "theme": self._first_truthy(step1.get("theme"), payload.get("theme")),
            "category": self._first_truthy(step1.get("category"), step1.get("selectedEventType"), payload.get("category")),
            "is_draft": False,
            "status": "published",
            "base_price": self._first_truthy(step5.get("base_price"), step6.get("base_price"), payload.get("base_price"), 0),
            "features": step7.get("features") or payload.get("features") or None,
        }`,
  },

  eventDate: {
    id: 'eventDate',
    file: 'backend/main/events/views.py',
    firstLine: 351,
    lang: 'python',
    text: `        start_dt = parse_datetime(str(self._first_truthy(step1.get("start_date"), payload.get("start_date")) or ""))
        end_dt = parse_datetime(str(self._first_truthy(step1.get("end_date"), payload.get("end_date")) or ""))
        date_value = self._first_truthy(step1.get("date"), payload.get("date"))
        parsed_date = parse_date(str(date_value)) if date_value else None
        event_date = parsed_date or (start_dt.date() if start_dt else timezone.localdate())`,
  },

  publish: {
    id: 'publish',
    file: 'backend/main/events/views.py',
    firstLine: 502,
    lang: 'python',
    text: `        with transaction.atomic():
            instance.status = EventDraft.Status.PUBLISHED
            if instance.published_at is None:
                instance.published_at = timezone.now()

            draft_payload = instance.data if isinstance(instance.data, dict) else {}
            published_event_id = draft_payload.get("published_event_id")
            event_id = request.data.get("event_id") or published_event_id

            if event_id:
                try:
                    published_event = Event.objects.select_for_update().get(id=event_id, organizer=request.user)
                    published_event = self._upsert_event_from_draft(instance, request=request, event=published_event)
                except Event.DoesNotExist:
                    published_event = self._upsert_event_from_draft(instance, request=request)
            else:
                published_event = self._upsert_event_from_draft(instance, request=request)

            draft_payload["published_event_id"] = published_event.id
            instance.data = draft_payload`,
  },

  partialUpdate: {
    id: 'partialUpdate',
    file: 'backend/main/events/views.py',
    firstLine: 290,
    lang: 'python',
    text: `        # Merge data payloads if provided
        incoming_data = serializer.validated_data.get("data")
        if incoming_data is not None:
            serializer.validated_data["data"] = {**(instance.data or {}), **incoming_data}
        if not serializer.validated_data.get("current_step"):
            serializer.validated_data["current_step"] = instance.current_step
        serializer.save()`,
  },

  readiness: {
    id: 'readiness',
    file: 'frontend/src/ListingReview.jsx',
    firstLine: 260,
    lang: 'javascript',
    text: `                {showReadinessModal && (
                    <ReadinessModal
                        requests={bookingRequests}
                        onConfirm={handlePublish}
                        onClose={() => setShowReadinessModal(false)}
                        isPublishing={isPublishing}`,
  },
}
