from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from events.models import Event
from vendors.models import Service
from artists.models import Artist
from events.serializer import EventSerializer
from vendors.serializers import ServiceSerializer
from artists.serializers import PopularArtistSerializer
from django.db.models import Q


class GlobalSearchAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '').strip()
        search_type = request.query_params.get('type', 'all')

        if not query:
            return Response({"results": [], "query": query}, status=status.HTTP_200_OK)

        response_data = {"query": query}

        if search_type in ('all', 'events'):
            events = Event.objects.filter(
                Q(name__icontains=query) |
                Q(location__icontains=query) |
                Q(category__icontains=query)
            )[:20]
            response_data['events'] = EventSerializer(events, many=True, context={'request': request}).data

        if search_type in ('all', 'artists'):
            artists = Artist.objects.select_related('user').filter(
                Q(name__icontains=query) |
                Q(bio__icontains=query) |
                Q(genres__icontains=query)
            )[:20]
            response_data['artists'] = PopularArtistSerializer(artists, many=True, context={'request': request}).data

        if search_type in ('all', 'services'):
            services = Service.objects.filter(
                Q(name__icontains=query) |
                Q(vendor__name__icontains=query) |
                Q(category__name__icontains=query) |
                Q(location_tags__icontains=query)
            )[:20]
            response_data['services'] = ServiceSerializer(services, many=True, context={'request': request}).data

        return Response(response_data, status=status.HTTP_200_OK)