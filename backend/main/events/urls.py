from django.urls import path

from . import views
from .views import EventCreateView, EventListView, EventUpdateView, EventDeleteView

urlpatterns = [
    path("create/",EventCreateView.as_view(),name="event_create"),
    path("",EventListView.as_view(),name="event_explore"),
    path("<int:pk>/update/", EventUpdateView.as_view(), name="event_update"),
    path("<int:pk>/delete/", EventDeleteView.as_view(), name="event_delete"),
]