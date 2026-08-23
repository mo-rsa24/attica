// Verbatim excerpts from /home/molef/Work/attica. Nothing here is paraphrased.
// `first` is the real line number of the first line of `text`.

export type Excerpt = {
  file: string
  first: number
  lang: 'py' | 'jsx' | 'json' | 'text'
  text: string
}

export const CODE: Record<string, Excerpt> = {
  'users/views.py:login': {
    file: 'backend/main/users/views.py',
    first: 43,
    lang: 'py',
    text: `class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Return user details and roles along with the tokens."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer`,
  },

  'users/serializers.py:UserSerializer': {
    file: 'backend/main/users/serializers.py',
    first: 5,
    lang: 'py',
    text: `class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="name",
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "roles",
        ]`,
  },

  'users/models.py:CustomUser': {
    file: 'backend/main/users/models.py',
    first: 25,
    lang: 'py',
    text: `class CustomUser(AbstractUser):
    USER_TYPES = [
        ('organizer', 'Organizer'),
        ('vendor', 'Vendor'),
        ('artist', 'Artist'),
        ('venue', 'Venue Rep'),
        ('attendee', 'Attendee'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='organizer')
    profile_picture = models.ImageField(upload_to='profiles/', default='default_profile.jpg')
    roles = models.ManyToManyField(Role, blank=True)`,
  },

  'users/models.py:Role': {
    file: 'backend/main/users/models.py',
    first: 9,
    lang: 'py',
    text: `class Role(models.Model):
    """Simple role model so that a user can have multiple roles."""

    class Names(models.TextChoices):
        EVENT_ORGANIZER = "EVENT_ORGANIZER", "Event Organizer"
        ARTIST = "ARTIST", "Artist"
        SERVICE_PROVIDER = "SERVICE_PROVIDER", "Service Provider"
        VENUE_MANAGER = "VENUE_MANAGER", "Venue Manager"
        TICKET_BUYER = "TICKET_BUYER", "Ticket Buyer"

    name = models.CharField(max_length=30, choices=Names.choices, unique=True)`,
  },

  'AuthProvider.jsx:login': {
    file: 'frontend/src/AuthProvider.jsx',
    first: 100,
    lang: 'jsx',
    text: `    const login = async (username, password) => {
        const res = await fetch('/api/accounts/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            setTokens({ access: data.access, refresh: data.refresh });
            if (data.user) {
                setUser(data.user);
                if (data.user.roles?.length) {
                    setCurrentRole(data.user.roles[0]);
                }
            }
            return true;
        }
        return false;
    };`,
  },

  'AuthProvider.jsx:fetchUser': {
    file: 'frontend/src/AuthProvider.jsx',
    first: 61,
    lang: 'jsx',
    text: `        localStorage.setItem('tokens', JSON.stringify(tokens));
        const decoded = jwtDecode(tokens.access);
        const isExpired = decoded.exp * 1000 < Date.now();
        console.log('Token expired?', isExpired);

        const fetchUser = async () => {
            let tokenValid = true;
            if (isExpired) {
                tokenValid = await refreshToken();
            }
            if (tokenValid) {
                fetch('/api/accounts/me/', {
                    headers: { Authorization: \`Bearer \${tokens.access}\` }
                })`,
  },

  'Login.jsx:submit': {
    file: 'frontend/src/Login.jsx',
    first: 14,
    lang: 'jsx',
    text: `  const handleSubmit = async e => {
    e.preventDefault()
    const ok = await login(username, password)
    if (ok) {
      navigate('/')
    } else {
      setError('Invalid credentials')
    }
  }`,
  },

  'ProfileRedirect.jsx:resolve': {
    file: 'frontend/src/ProfileRedirect.jsx',
    first: 26,
    lang: 'jsx',
    text: `        const resolveTargetPath = async () => {
            const directArtistId = toPositiveNumber(user?.artist_profile_id);
            if (directArtistId) {
                if (isMounted) {
                    setTargetPath(\`/artists/\${directArtistId}\`);
                    setIsResolving(false);
                }
                return;
            }

            if (!user?.id) {
                if (isMounted) {
                    setTargetPath('/profile/edit');
                    setIsResolving(false);
                }
                return;
            }

            try {
                const {data} = await api.get('/api/artists/artists/', {
                    params: {user: user.id},
                });
                const matchedArtist = toArtistList(data)[0];
                const matchedArtistId = toPositiveNumber(matchedArtist?.id);

                if (isMounted) {
                    setTargetPath(matchedArtistId ? \`/artists/\${matchedArtistId}\` : '/profile/edit');
                }`,
  },

  'users/views.py:UserProfileView': {
    file: 'backend/main/users/views.py',
    first: 83,
    lang: 'py',
    text: `class UserProfileView(APIView):
    """
    View to retrieve and update the profile of the currently logged-in user.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)`,
  },

  'users/models.py:UserProfile': {
    file: 'backend/main/users/models.py',
    first: 41,
    lang: 'py',
    text: `class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)`,
  },

  'App.jsx:organizers': {
    file: 'frontend/src/App.jsx',
    first: 148,
    lang: 'jsx',
    text: `                    <Route path="/organizers/:id" element={requireAuth(<OrganizerProfilePage/>)} />`,
  },

  'grep:organizers': {
    file: 'shell',
    first: 1,
    lang: 'text',
    text: `$ grep -rn "organizers/" frontend/src --include=*.jsx --include=*.js
frontend/src/App.jsx:148:                    <Route path="/organizers/:id" element={requireAuth(<OrganizerProfilePage/>)} />

1 hit. The route is the only reference. No Link, no navigate.`,
  },

  'App.jsx:listing': {
    file: 'frontend/src/App.jsx',
    first: 119,
    lang: 'jsx',
    text: `                        <Route index element={<ListingStep1/>}/>
                        <Route path="step1" element={<ListingStep1/>}/>
                        <Route path="step2" element={<Navigate to="step1" replace/>}/>
                        <Route path="step3" element={<ListingStep3/>}/>`,
  },

  'events/models.py:EventDraft': {
    file: 'backend/main/events/models.py',
    first: 99,
    lang: 'py',
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
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)`,
  },

  'events/views.py:partial_update': {
    file: 'backend/main/events/views.py',
    first: 281,
    lang: 'py',
    text: `    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user:
            return Response({"detail": "You do not have permission to edit this event."}, status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop('partial', True)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Merge data payloads if provided
        incoming_data = serializer.validated_data.get("data")
        if incoming_data is not None:
            serializer.validated_data["data"] = {**(instance.data or {}), **incoming_data}
        if not serializer.validated_data.get("current_step"):
            serializer.validated_data["current_step"] = instance.current_step
        serializer.save()
        return Response(serializer.data)`,
  },

  'events/views.py:get_object': {
    file: 'backend/main/events/views.py',
    first: 240,
    lang: 'py',
    text: `    def get_queryset(self):
        return self.queryset.filter(organizer=self.request.user).prefetch_related("assets")

    def perform_create(self, serializer):
        serializer.save(
            organizer=self.request.user,
            current_step=serializer.validated_data.get("current_step") or self.FIRST_STEP,
        )

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        if obj.organizer != self.request.user:
            raise PermissionDenied("You do not have permission to access this event.")
        return obj`,
  },

  'events/views.py:upload_asset': {
    file: 'backend/main/events/views.py',
    first: 437,
    lang: 'py',
    text: `    @action(detail=True, methods=["post"], url_path="assets", parser_classes=[MultiPartParser, FormParser])
    def upload_asset(self, request, *args, **kwargs):
        draft = self.get_object()
        draft_asset_model = self._draft_asset_model()
        upload = request.FILES.get("file")
        asset_type = request.data.get("asset_type")
        current_step = request.data.get("current_step")

        if upload is None:
            raise ValidationError({"file": "A file is required."})
        if asset_type not in draft_asset_model.AssetType.values:
            raise ValidationError({"asset_type": "Unsupported asset type."})`,
  },

  'events/views.py:publish': {
    file: 'backend/main/events/views.py',
    first: 497,
    lang: 'py',
    text: `    def publish(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user:
            return Response({"detail": "You do not have permission to publish this event."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
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

            if not isinstance(draft_payload, dict):
                draft_payload = {}
            draft_payload["published_event_id"] = published_event.id
            instance.data = draft_payload
            instance.save(update_fields=["status", "published_at", "data", "updated_at"])

            from scheduling.services import finalize_draft_bookings

            finalize_summary = finalize_draft_bookings(
                draft=instance,
                published_event=published_event,
                organizer=request.user,
            )`,
  },

  'events/views.py:build_payload': {
    file: 'backend/main/events/views.py',
    first: 384,
    lang: 'py',
    text: `        event_payload = {
            "location": location,
            "name": self._first_truthy(step1.get("name"), step1.get("eventName"), payload.get("name"), payload.get("eventName"), "Untitled event"),
            "date": event_date,
            "budget": self._first_truthy(step5.get("budget"), payload.get("budget")),
            "base_price": self._first_truthy(step5.get("base_price"), step6.get("base_price"), payload.get("base_price"), 0),
            "currency": self._first_truthy(step5.get("currency"), step6.get("currency"), payload.get("currency"), "ZAR"),
            "tiered_prices": self._first_truthy(step6.get("tiered_prices"), payload.get("tiered_prices")),
            "features": step7.get("features") or payload.get("features") or None,
            "is_draft": False,
            "status": "published",
        }`,
  },

  'events/views.py:MyEventsAPIView': {
    file: 'backend/main/events/views.py',
    first: 539,
    lang: 'py',
    text: `class MyEventsAPIView(generics.GenericAPIView):
    """
    Organizer-only listing of drafts and published events for the authenticated user.
    """

    serializer_class = MyEventSummarySerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        organizer = request.user
        drafts = EventDraft.objects.filter(organizer=organizer).order_by("-updated_at")
        published = Event.objects.filter(
            Q(organizer=organizer) | Q(user=organizer)
        ).filter(status="published").order_by("-updated_at")

        return Response({
            "drafts": self.get_serializer(drafts, many=True).data,
            "published": self.get_serializer(published, many=True).data,
        })`,
  },

  'events/serializer.py:MyEventSummary': {
    file: 'backend/main/events/serializer.py',
    first: 227,
    lang: 'py',
    text: `    def to_representation(self, instance):
        if isinstance(instance, EventDraft):
            name = _extract_draft_name(instance.data or {})
            return {
                "id": instance.id,
                "name": name,
                "status": instance.status,
                "lifecycle_state": "draft",
                "current_step": instance.current_step,
                "published_at": instance.published_at,
                "record_type": "draft",
                "is_draft": True,
                "readiness_state": "in_progress" if instance.status == EventDraft.Status.DRAFT else "ready",
                "organizer_id": instance.organizer_id,
            }`,
  },

  'MyEventsPage.jsx:parse': {
    file: 'frontend/src/MyEventsPage.jsx',
    first: 366,
    lang: 'jsx',
    text: `            if (isOrganizerRole) {
                const response = await fetch('/api/events/my-events/', {headers, signal});
                if (!response.ok) {
                    throw new Error('Unable to load your events right now.');
                }
                const payload = await response.json();
                setDrafts(payload?.drafts || []);
                setPublishedEvents(payload?.published || []);
                return;
            }`,
  },

  'MyEventsPage.jsx:resume': {
    file: 'frontend/src/MyEventsPage.jsx',
    first: 121,
    lang: 'jsx',
    text: `const resolveStepRoute = (currentStep, eventId) => {
    if (!currentStep) return null;
    const rawKey = typeof currentStep === 'string' ? currentStep.toLowerCase() : currentStep;
    if (STEP_ROUTE_MAP[rawKey]) {
        return eventId ? \`/listing/\${eventId}/\${STEP_ROUTE_MAP[rawKey]}\` : null;
    }

    const parsed = Number(rawKey);
    if (!Number.isNaN(parsed) && STEP_ROUTE_MAP[parsed]) {
        return eventId ? \`/listing/\${eventId}/\${STEP_ROUTE_MAP[parsed]}\` : null;
    }`,
  },

  'ListingWizardLayout.jsx:mount': {
    file: 'frontend/src/ListingWizardLayout.jsx',
    first: 69,
    lang: 'jsx',
    text: `        const fetchEvent = async () => {
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
            }`,
  },

  'reactContext.jsx:loadEvent': {
    file: 'frontend/src/context/reactContext.jsx',
    first: 306,
    lang: 'jsx',
    text: `    const loadEvent = useCallback(async (id) => {
        if (!id) return null;
        dispatch({ type: 'setLoading', payload: true });
        try {
            const response = await authFetch(\`/api/events/event-drafts/\${id}/\`);
            if (!response.ok) {
                throw new Error('Failed to load event from the server.');
            }
            const payload = await response.json();
            const currentState = stateRef.current;
            const backendSteps = payload?.data?.steps || {};`,
  },

  'reactContext.jsx:saveStep': {
    file: 'frontend/src/context/reactContext.jsx',
    first: 404,
    lang: 'jsx',
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

  'reactContext.jsx:publish': {
    file: 'frontend/src/context/reactContext.jsx',
    first: 469,
    lang: 'jsx',
    text: `    const publish = useCallback(async (id) => {
        const eventId = id || state.event?.id;
        if (!eventId) {
            dispatch({ type: 'setError', payload: 'No event to publish. Save a draft first.' });
            return false;
        }
        dispatch({ type: 'setSaving', payload: true });
        try {
            const response = await authFetch(\`/api/events/event-drafts/\${eventId}/publish/\`, {
                method: 'POST',
            });`,
  },

  'CreateEventPage.jsx:post': {
    file: 'frontend/src/CreateEventPage.jsx',
    first: 60,
    lang: 'jsx',
    text: `            const response = await api.post('/api/events/event-drafts/', {`,
  },

  'scheduling/models.py:MarketplaceResource': {
    file: 'backend/main/scheduling/models.py',
    first: 14,
    lang: 'py',
    text: `class MarketplaceResource(TimeStampedModel):
    class ResourceType(models.TextChoices):
        VENUE = "venue", "Venue"
        ARTIST = "artist", "Artist"
        VENDOR = "vendor", "Vendor"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="marketplace_resources",
    )
    resource_type = models.CharField(max_length=16, choices=ResourceType.choices)
    display_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    artist = models.OneToOneField(
        "artists.Artist",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="marketplace_resource",
    )`,
  },

  'artists/models.py:Artist': {
    file: 'backend/main/artists/models.py',
    first: 5,
    lang: 'py',
    text: `class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='artists')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='artist_profile')
    booking_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                      help_text="Cost per performance or hourly rate.")`,
  },

  'BookArtistPage.jsx:load': {
    file: 'frontend/src/BookArtistPage.jsx',
    first: 63,
    lang: 'jsx',
    text: `        // 1. Fetch artist profile
        const artistRes = await fetch(\`/api/artists/artists/\${id}/\`, { headers });
        if (!artistRes.ok) {
          setPageError('Artist not found.');
          return;
        }
        const artistData = await artistRes.json();
        if (cancelled) return;
        setArtist(artistData);

        // 2. Find MarketplaceResource by owner_id
        const ownerId = artistData.owner || artistData.owner_id;
        if (ownerId) {
          const resourceData = await schedulingApi.getResources(tokens.access);
          const resources = Array.isArray(resourceData) ? resourceData : (resourceData?.results ?? []);
          const match = resources.find(
            (r) => String(r.owner) === String(ownerId) || String(r.owner_id) === String(ownerId)
          );
          if (!cancelled) setResource(match || null);
        }

        // 3. Fetch organizer's events
        const eventsRes = await fetch('/api/events/my-events/', { headers });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (!cancelled) {
            setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.results ?? []));
          }
        }`,
  },

  'BookArtistPage.jsx:noresource': {
    file: 'frontend/src/BookArtistPage.jsx',
    first: 153,
    lang: 'jsx',
    text: `  if (!resource) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        ...
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="text-amber-800 font-semibold text-lg mb-2">Not available for online booking</p>
          <p className="text-amber-700 text-sm">
            {artist.name} hasn&apos;t set up online booking yet. Contact them directly to discuss your event.
          </p>
        </div>
      </div>
    );
  }`,
  },

  'BookArtistPage.jsx:dropdown': {
    file: 'frontend/src/BookArtistPage.jsx',
    first: 198,
    lang: 'jsx',
    text: `            <option value="">— No specific event (one-off booking) —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name || ev.title || \`Event #\${ev.id}\`}
              </option>
            ))}
          </select>
          {events.length === 0 && (
            <p className="mt-1.5 text-xs text-gray-400">
              No events found.{' '}
              <Link to="/createEvent" className="text-rose-500 hover:underline">Create an event</Link>
            </p>
          )}`,
  },

  'BookArtistPage.jsx:submit': {
    file: 'frontend/src/BookArtistPage.jsx',
    first: 113,
    lang: 'jsx',
    text: `    try {
      const body = {
        resource_id: resource.id,
        start_at: toIsoFromLocalInput(startAt),
        end_at: toIsoFromLocalInput(endAt),
        attendee_count: attendeeCount ? parseInt(attendeeCount, 10) : null,
        message,
        ...(selectedEventId ? { event_id: parseInt(selectedEventId, 10) } : {}),
      };
      const result = await schedulingApi.createRequest(tokens.access, body);
      navigate(\`/bookings/\${result.id}\`);
    } catch (err) {
      setSubmitError(err.message || 'Could not submit booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }`,
  },

  'schedulingApi.js:createRequest': {
    file: 'frontend/src/api/schedulingApi.js',
    first: 74,
    lang: 'jsx',
    text: `  createRequest: async (token, body) => {
    // Accepts body with event_id OR event_draft_id (for in-wizard booking)
    const response = await fetch(\`\${API_ROOT}/requests/create/\`, {
      method: 'POST',
      headers: authHeaders(token, {
        'Content-Type': 'application/json',
        'Idempotency-Key': generateIdempotencyKey('request'),
      }),
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },`,
  },

  'schedulingApi.js:parseResponse': {
    file: 'frontend/src/api/schedulingApi.js',
    first: 17,
    lang: 'jsx',
    text: `const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const message = payload?.detail || payload?.message || \`Request failed (\${response.status})\`;
    throw new Error(message);
  }
  return payload;
};`,
  },

  'ProviderCard.jsx:request': {
    file: 'frontend/src/components/booking/ProviderCard.jsx',
    first: 112,
    lang: 'jsx',
    text: `  const handleRequest = async () => {
    if (!selectedRange?.start || !selectedRange?.end || !eventDraftId) return;
    setLoading(true);
    setError('');
    try {
      const created = await schedulingApi.createRequest(authToken, {
        event_draft_id: Number(eventDraftId),
        resource_id: provider.resource_id,
        start_at: dayjs(selectedRange.start).toISOString(),
        end_at: dayjs(selectedRange.end).toISOString(),
        attendee_count: 1,
      });`,
  },

  'scheduling/views.py:CreateRequest': {
    file: 'backend/main/scheduling/views.py',
    first: 454,
    lang: 'py',
    text: `class CreateRequestAPIView(BaseSchedulingAPIView):
    def post(self, request):
        serializer = CreateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        event = None
        event_draft = None

        if payload.get("event_id"):
            from events.models import Event as EventModel
            event = get_object_or_404(EventModel, id=payload["event_id"])
            if not can_manage_event(request.user, event):
                raise PermissionDenied("You do not have permission to create a request for this event.")
        elif payload.get("event_draft_id"):
            from events.models import EventDraft
            event_draft = get_object_or_404(EventDraft, id=payload["event_draft_id"])
            if event_draft.organizer_id != request.user.id:
                raise PermissionDenied("You do not have permission to create a request for this event draft.")
        else:
            return Response(
                {"detail": "Either event_id or event_draft_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resource = get_object_or_404(MarketplaceResource, id=payload["resource_id"], is_active=True)
        idempotency_key = request.headers.get("Idempotency-Key")`,
  },

  'scheduling/services.py:idempotency': {
    file: 'backend/main/scheduling/services.py',
    first: 114,
    lang: 'py',
    text: `def _get_or_assert_idempotency(*, owner, endpoint: str, key: str | None, payload: dict):
    if not key:
        return None

    digest = _request_hash(payload)
    existing = IdempotencyRecord.objects.filter(owner=owner, endpoint=endpoint, key=key).first()
    if not existing:
        return None

    if existing.request_hash != digest:
        raise IdempotencyConflictError("Idempotency key reused with a different payload.")

    return existing`,
  },

  'scheduling/services.py:create_request': {
    file: 'backend/main/scheduling/services.py',
    first: 468,
    lang: 'py',
    text: `    with transaction.atomic():
        booking_request = BookingRequest.objects.create(
            event=event,
            event_draft=event_draft,
            organizer=organizer,
            resource=resource,
            requested_start_at=start_at,
            requested_end_at=end_at,
            attendee_count=attendee_count,
            message=message,
            status=BookingRequest.Status.PENDING,
            expires_at=timezone.now() + timedelta(hours=48),
            idempotency_key=idempotency_key,
        )
        _create_audit(
            actor=organizer,
            action="request.created",
            target_type="BookingRequest",
            target_id=booking_request.id,
        )
        _emit_outbox(
            event_type="request.created",
            aggregate_type="booking_request",
            aggregate_id=booking_request.id,
        )

        # Notify the resource owner immediately (do not wait for outbox worker).
        _create_in_app_notification(
            recipient=resource.owner,
            sender=organizer,
            notification_type=Notification.NotificationType.BOOKING_REQUEST,
            title=f"New booking request for {resource.display_name}",
        )`,
  },

  'scheduling/models.py:BookingRequest': {
    file: 'backend/main/scheduling/models.py',
    first: 300,
    lang: 'py',
    text: `class BookingRequest(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DECLINED = "declined", "Declined"
        COUNTER_PROPOSED = "counter_proposed", "Counter Proposed"
        WITHDRAWN = "withdrawn", "Withdrawn"
        EXPIRED = "expired", "Expired"

    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, null=True, blank=True,
                              related_name="scheduling_requests")
    event_draft = models.ForeignKey("events.EventDraft", on_delete=models.CASCADE, null=True, blank=True,
                                    related_name="scheduling_requests")
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                  related_name="booking_requests_created")
    resource = models.ForeignKey(MarketplaceResource, on_delete=models.CASCADE,
                                 related_name="booking_requests")
    requested_start_at = models.DateTimeField()
    requested_end_at = models.DateTimeField()
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    expires_at = models.DateTimeField(null=True, blank=True)
    estimated_total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)`,
  },

  'scheduling/services.py:finalize': {
    file: 'backend/main/scheduling/services.py',
    first: 1814,
    lang: 'py',
    text: `def finalize_draft_bookings(*, draft, published_event, organizer):
    with transaction.atomic():
        now = timezone.now()
        approved_requests = list(
            BookingRequest.objects.select_for_update()
            .select_related("resource", "resource__owner", "organizer", "checkout_session")
            .filter(event_draft=draft, status=BookingRequest.Status.APPROVED)
            .order_by("id")
        )`,
  },

  'chat/signals.py:sync': {
    file: 'backend/main/chat/signals.py',
    first: 37,
    lang: 'py',
    text: `        qs = BookingRequest.objects.filter(
            organizer=bid.organizer,
            resource__owner=bid.vendor,
        ).exclude(status__in=terminal_statuses)

        # Narrow by event if the bid carries event context
        if bid.event_id:
            qs = qs.filter(event_id=bid.event_id)

        candidates = list(qs)

        if not candidates:
            logger.debug(
                "ChatBid %s accepted but no matching BookingRequest found "
                "(organizer=%s, vendor=%s, event=%s).",
                bid.pk, bid.organizer_id, bid.vendor_id, bid.event_id,
            )
            return

        # If multiple candidates, prefer the one with the most recent activity
        request = sorted(candidates, key=lambda r: r.updated_at, reverse=True)[0]

        agreed_amount = bid.counter_amount if bid.counter_amount is not None else bid.amount

        if request.estimated_total_amount != agreed_amount:
            request.estimated_total_amount = agreed_amount
            request.save(update_fields=["estimated_total_amount", "updated_at"])`,
  },

  'chat/models.py:Booking': {
    file: 'backend/main/chat/models.py',
    first: 123,
    lang: 'py',
    text: `class Booking(models.Model):
    """
    Represents a booking request from an Event Organizer to a Provider.
    Links an event with a provider through the chat/bid system.
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING = 'pending', 'Pending'
        SUCCESSFUL = 'successful', 'Successful'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'

    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='bookings')
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                  related_name='bookings_created')`,
  },

  'BookingRequestPage.jsx:dm': {
    file: 'frontend/src/BookingRequestPage.jsx',
    first: 743,
    lang: 'jsx',
    text: `  const handleOpenDM = async () => {
    if (!organizerUsername) return;
    setOpeningChat(true);
    try {
      const res = await fetch(\`/api/chat/rooms/with/\${organizerUsername}/\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${tokens?.access}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });`,
  },

  'ProviderAvailabilityPage.jsx:optin': {
    file: 'frontend/src/ProviderAvailabilityPage.jsx',
    first: 47,
    lang: 'jsx',
    text: `      const method = resource ? 'PATCH' : 'POST';
      const url = resource
        ? \`/api/scheduling/resources/\${resource.id}/\`
        : '/api/scheduling/resources/';`,
  },
}
