from rest_framework import serializers
from .models import Service, Category, Review, ServiceImage, Vendor, VendorPost, Booking, Region, Policy, Amenity


class VendorBriefSerializer(serializers.ModelSerializer):
    """Minimal vendor information for nested use"""

    profile_image = serializers.ImageField(source="portfolio")
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Vendor
        fields = ["id", "name", "profile_image", "rating", "username"]
class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name", "icon"]


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = ["id", "type", "text"]


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name", "slug"]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "service",
            "start_date",
            "end_date",
            "timeslot",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "user", "status", "created_at"]

class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ["id", "image"]


class ServiceSerializer(serializers.ModelSerializer):
    # vendor = serializers.PrimaryKeyRelatedField(read_only=True)  # avoid full circular nesting
    vendor = VendorBriefSerializer(read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    likes = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "vendor",
            "category_name",
            "image",
            "rating",
            "price",
            "location_tags",
            "likes",
            "liked",
        ]

    def get_likes(self, obj):
        return obj.likes.count()

    def get_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False



class VendorSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source="portfolio")
    services = ServiceSerializer(many=True, source="vendorservices", read_only=True)

    class Meta:
        model = Vendor
        fields = [
            "id",
            "name",
            "profile_image",
            "description",
            "rating",
            "services",
        ]


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "comment", "likes", "user"]

class ServiceDetailSerializer(ServiceSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    gallery = ServiceImageSerializer(many=True, source="images", read_only=True)
    description = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    number_of_guests = serializers.IntegerField()

    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + [
            "description",
            "price",
            "number_of_guests",
            "reviews",
            "gallery",
        ]
class CategorySerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, source="servicecategory", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "services"]

class VendorPostSerializer(serializers.ModelSerializer):
    """Serializer for vendor posts used by the React frontend."""

    class Meta:
        model = VendorPost
        fields = ["id", "vendor", "image", "caption", "likes", "created_at"]
        read_only_fields = ["id", "vendor", "likes", "created_at"]


class VendorDetailSerializer(VendorSerializer):
    posts = VendorPostSerializer(many=True, read_only=True)

    class Meta(VendorSerializer.Meta):
        fields = VendorSerializer.Meta.fields + [
            "category",
            "price_range",
            "testimonial",
            "posts",
        ]
