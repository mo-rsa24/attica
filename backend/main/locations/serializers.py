from rest_framework import serializers

from events.models import Event
from .models import Location, VenueBooking, LocationImage, Feature, FloorPlan, LocationReview, WaitlistEntry, Question, \
    Wish


class LocationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationImage
        fields = ['id', 'image_url', 'image_type']

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['id', 'name', 'icon']

class FloorPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = FloorPlan
        fields = ['id', 'name', 'image_url']

class LocationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationReview
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class VenueSerializer(serializers.ModelSerializer):
    images = LocationImageSerializer(many=True, read_only=True)
    features = FeatureSerializer(many=True, read_only=True)
    floor_plans = FloorPlanSerializer(many=True, read_only=True)
    reviews = LocationReviewSerializer(many=True, read_only=True)
    class Meta:
        model = Location
        fields = ['id', 'name','address','capacity','is_approved',
                  'venue_count', 'image', 'image_url', 'created_at', 'updated_at', 'rating', 'listed_date', 'price', 'images', 'features', 'floor_plans',
                  'reviews']

class PopularVenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'name', 'image', 'venue_count')


class LocationSerializer(serializers.ModelSerializer):
    images = LocationImageSerializer(many=True, read_only=True)
    features = FeatureSerializer(many=True, read_only=True)
    floor_plans = FloorPlanSerializer(many=True, read_only=True)
    reviews = LocationReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'capacity', 'image_url', 'rating', 'listed_date', 'price', 'images', 'features', 'floor_plans', 'reviews', 'latitude', 'longitude']

class VenueBookingSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)

    class Meta:
        model = VenueBooking
        fields = '__all__'

class WaitlistEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WaitlistEntry
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class WishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wish
        fields = '__all__'