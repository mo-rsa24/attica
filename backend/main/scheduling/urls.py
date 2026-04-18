from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AcceptCounterAPIView,
    ApproveRequestAPIView,
    AvailabilityExceptionViewSet,
    AvailabilityRuleViewSet,
    AvailabilitySearchAPIView,
    AvailabilitySearchEnrichedAPIView,
    AvailabilitySlotViewSet,
    BookingConflictIncidentViewSet,
    BookingRequestViewSet,
    BookingViewSet,
    CalendarViewAPIView,
    CancelBookingAPIView,
    CheckoutSessionDetailAPIView,
    CheckoutSessionListAPIView,
    CompleteBookingAPIView,
    CompleteMockDepositAPIView,
    CounterProposalAPIView,
    CreateBookingAPIView,
    CreateRequestAPIView,
    DeclineRequestAPIView,
    MarketplaceResourceViewSet,
    NudgeRequestAPIView,
    OutboxDeadLetterViewSet,
    OutboxEventOpsViewSet,
    RejectCounterAPIView,
    RefreshCheckoutAPIView,
    ReleaseCheckoutAPIView,
    ResourcePolicyViewSet,
    RescheduleBookingAPIView,
    ReviewViewSet,
    SchedulingOpsSummaryAPIView,
    StartCheckoutAPIView,
    WebhookTargetViewSet,
    WithdrawRequestAPIView,
)

router = DefaultRouter()
router.register(r"resources", MarketplaceResourceViewSet, basename="scheduling-resource")
router.register(r"resource-policies", ResourcePolicyViewSet, basename="scheduling-policy")
router.register(r"availability-rules", AvailabilityRuleViewSet, basename="scheduling-rule")
router.register(r"availability-exceptions", AvailabilityExceptionViewSet, basename="scheduling-exception")
router.register(r"availability-slots", AvailabilitySlotViewSet, basename="scheduling-slot")
router.register(r"requests", BookingRequestViewSet, basename="scheduling-request")
router.register(r"bookings", BookingViewSet, basename="scheduling-booking")
router.register(r"webhook-targets", WebhookTargetViewSet, basename="scheduling-webhook-target")
router.register(r"ops/outbox-events", OutboxEventOpsViewSet, basename="scheduling-ops-outbox-event")
router.register(r"ops/dead-letters", OutboxDeadLetterViewSet, basename="scheduling-ops-dead-letter")
router.register(r"ops/conflict-incidents", BookingConflictIncidentViewSet, basename="scheduling-ops-conflict-incident")
router.register(r"reviews", ReviewViewSet, basename="scheduling-review")

urlpatterns = [
    path("availability/search/", AvailabilitySearchAPIView.as_view(), name="scheduling-availability-search"),
    path("checkout-sessions/", CheckoutSessionListAPIView.as_view(), name="scheduling-checkout-list"),
    path("checkout-sessions/<int:checkout_session_id>/", CheckoutSessionDetailAPIView.as_view(), name="scheduling-checkout-detail"),
    path("availability/search/enriched/", AvailabilitySearchEnrichedAPIView.as_view(), name="scheduling-availability-search-enriched"),
    path("bookings/create/", CreateBookingAPIView.as_view(), name="scheduling-booking-create"),
    path("requests/create/", CreateRequestAPIView.as_view(), name="scheduling-request-create"),
    path("checkout-sessions/start/", StartCheckoutAPIView.as_view(), name="scheduling-checkout-start"),
    path(
        "checkout-sessions/<int:checkout_session_id>/refresh/",
        RefreshCheckoutAPIView.as_view(),
        name="scheduling-checkout-refresh",
    ),
    path(
        "checkout-sessions/<int:checkout_session_id>/complete-mock-deposit/",
        CompleteMockDepositAPIView.as_view(),
        name="scheduling-checkout-complete-mock-deposit",
    ),
    path(
        "checkout-sessions/<int:checkout_session_id>/release/",
        ReleaseCheckoutAPIView.as_view(),
        name="scheduling-checkout-release",
    ),
    path("requests/<int:request_id>/approve/", ApproveRequestAPIView.as_view(), name="scheduling-request-approve"),
    path("requests/<int:request_id>/decline/", DeclineRequestAPIView.as_view(), name="scheduling-request-decline"),
    path("requests/<int:request_id>/counter/", CounterProposalAPIView.as_view(), name="scheduling-request-counter"),
    path("requests/<int:request_id>/accept-counter/", AcceptCounterAPIView.as_view(), name="scheduling-request-accept-counter"),
    path("requests/<int:request_id>/reject-counter/", RejectCounterAPIView.as_view(), name="scheduling-request-reject-counter"),
    path("requests/<int:request_id>/withdraw/", WithdrawRequestAPIView.as_view(), name="scheduling-request-withdraw"),
    path("requests/<int:request_id>/nudge/", NudgeRequestAPIView.as_view(), name="scheduling-request-nudge"),
    path("bookings/<int:booking_id>/cancel/", CancelBookingAPIView.as_view(), name="scheduling-booking-cancel"),
    path("bookings/<int:booking_id>/complete/", CompleteBookingAPIView.as_view(), name="scheduling-booking-complete"),
    path(
        "bookings/<int:booking_id>/reschedule/",
        RescheduleBookingAPIView.as_view(),
        name="scheduling-booking-reschedule",
    ),
    path("calendar/", CalendarViewAPIView.as_view(), name="scheduling-calendar"),
    path("ops/summary/", SchedulingOpsSummaryAPIView.as_view(), name="scheduling-ops-summary"),
    path("", include(router.urls)),
]
