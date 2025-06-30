from rest_framework import serializers
from .models import Service, Category

class ServiceSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField()

    class Meta:
        model = Service
        fields = ['id', 'name', 'vendor_name', 'category_name', 'image', 'rating', 'location_tags']

class CategorySerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, source='servicecategory', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'services']