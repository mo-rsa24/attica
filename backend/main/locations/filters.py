# backend/main/locations/filters.py

from django_filters import rest_framework as filters
from .models import Location, Feature

class LocationFilter(filters.FilterSet):
    capacity__gte = filters.NumberFilter(field_name="capacity", lookup_expr='gte')
    price__lte = filters.NumberFilter(field_name="price", lookup_expr='lte')
    features = filters.ModelMultipleChoiceFilter(
        field_name='features__name',
        to_field_name='name',
        queryset=Feature.objects.all(),
        conjoined=True,
    )

    class Meta:
        model = Location
        fields = ['capacity__gte', 'price__lte', 'features']