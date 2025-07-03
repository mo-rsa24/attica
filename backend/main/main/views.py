from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from events.models import Event
from vendors.models import Service
from events.serializer import EventSerializer
from vendors.serializers import ServiceSerializer
from django.db.models import Q


class GlobalSearchAPIView(APIView):
    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '')
        search_type = request.query_params.get('type', 'events')  # 'events' or 'services'

        if search_type == 'events':
            # Add more filters based on your needs (date, category, etc.)
            results = Event.objects.filter(
                Q(name__icontains=query) |
                Q(location__icontains=query) |
                Q(category__icontains=query)
            )
            serializer = EventSerializer(results, many=True)
        elif search_type == 'services':
            results = Service.objects.filter(
                Q(name__icontains=query) |
                Q(vendor__name__icontains=query) |
                Q(category__name__icontains=query) |
                Q(location_tags__icontains=query)
            )
            serializer = ServiceSerializer(results, many=True)
        else:
            return Response({"error": "Invalid search type"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data, status=status.HTTP_200_OK)