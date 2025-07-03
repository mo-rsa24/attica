from .views import EventCreateView, EventListView, EventUpdateView, EventDeleteView, EventViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/events', EventViewSet)

urlpatterns = [
    path("create/",EventCreateView.as_view(),name="event_create"),
    path("",EventListView.as_view(),name="event_explore"),
    path("<int:pk>/update/", EventUpdateView.as_view(), name="event_update"),
    path("<int:pk>/delete/", EventDeleteView.as_view(), name="event_delete"),
    path("", include(router.urls)),
]