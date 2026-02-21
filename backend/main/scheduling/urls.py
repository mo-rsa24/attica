from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ApproveRequestAPIView,
    AvailabilityExceptionViewSet,
    AvailabilityRuleViewSet,
    AvailabilitySearchAPIView,
    AvailabilitySlotViewSet,
    BookingConflictIncidentViewSet,
    BookingRequestViewSet,
    BookingViewSet,
    CalendarViewAPIView,
    CancelBookingAPIView,
    CreateBookingAPIView,
    CreateRequestAPIView,
    DeclineRequestAPIView,
    MarketplaceResourceViewSet,
    OutboxDeadLetterViewSet,
    OutboxEventOpsViewSet,
    ResourcePolicyViewSet,
    RescheduleBookingAPIView,
    SchedulingOpsSummaryAPIView,
    WebhookTargetViewSet,
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

urlpatterns = [
    path("availability/search/", AvailabilitySearchAPIView.as_view(), name="scheduling-availability-search"),
    path("bookings/create/", CreateBookingAPIView.as_view(), name="scheduling-booking-create"),
    path("requests/create/", CreateRequestAPIView.as_view(), name="scheduling-request-create"),
    path("requests/<int:request_id>/approve/", ApproveRequestAPIView.as_view(), name="scheduling-request-approve"),
    path("requests/<int:request_id>/decline/", DeclineRequestAPIView.as_view(), name="scheduling-request-decline"),
    path("bookings/<int:booking_id>/cancel/", CancelBookingAPIView.as_view(), name="scheduling-booking-cancel"),
    path(
        "bookings/<int:booking_id>/reschedule/",
        RescheduleBookingAPIView.as_view(),
        name="scheduling-booking-reschedule",
    ),
    path("calendar/", CalendarViewAPIView.as_view(), name="scheduling-calendar"),
    path("ops/summary/", SchedulingOpsSummaryAPIView.as_view(), name="scheduling-ops-summary"),
    path("", include(router.urls)),
]
