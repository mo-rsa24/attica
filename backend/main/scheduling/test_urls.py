from django.urls import include, path

urlpatterns = [
    path("api/scheduling/", include("scheduling.urls")),
]
