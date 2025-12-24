from django.contrib import admin
from .models import Location, LocationImage, Feature, FloorPlan, VenueBooking, LocationReview, Question, Wish, \
    WaitlistEntry, Amenity
from django.utils.html import format_html
# --- Inlines for Related Models ---
@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Amenity model.
    """
    list_display = ('name', 'icon')
    search_fields = ('name',)

class LocationImageInline(admin.TabularInline):
    """A compact inline for managing a location's gallery images."""
    model = LocationImage
    extra = 1
    verbose_name_plural = "Gallery Images"

class FeatureInline(admin.TabularInline):
    """A compact inline for managing a location's features."""
    model = Feature
    extra = 1

class FloorPlanInline(admin.StackedInline):
    """A more detailed inline for managing floor plans."""
    model = FloorPlan
    extra = 1
    classes = ('collapse',)

class LocationReviewInline(admin.TabularInline):
    """A read-only inline to display reviews for a location."""
    model = LocationReview
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')
    can_delete = False

class VenueBookingInline(admin.TabularInline):
    """A read-only inline to display event bookings for a location."""
    model = VenueBooking
    extra = 0
    readonly_fields = ('user', 'event', 'start_date', 'end_date', 'status')
    autocomplete_fields = ('user', 'event')
    can_delete = False
    verbose_name_plural = "Event Bookings"

# --- Main ModelAdmin Class ---

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    """Customized admin interface for the Location model."""
    list_display = ('name', 'address', 'region', 'is_featured', 'has_variable_pricing', 'is_approved', 'rating',  'is_featured','is_wheelchair_accessible')
    list_filter = ('is_approved', 'is_featured', 'is_wheelchair_accessible', 'has_variable_pricing', 'region', 'is_indoor', 'is_outdoor')
    search_fields = ('name', 'address', 'owner__username', 'region__name')
    readonly_fields = ('rating', 'created_at', 'updated_at')
    autocomplete_fields = ('owner', 'region')
    filter_horizontal = ('amenities',)
    fieldsets = (
        ('Core Information', {
            'fields': ('name', 'owner', 'address', 'region', 'is_approved', 'is_featured')
        }),
        ('Venue Details', {
            'fields': (
                'capacity',
                'parking_info',
                'is_wheelchair_accessible',
                'is_indoor',
                'is_outdoor',
            )
        }),
        ('Pricing & Budget', {
            'fields': (
                'price',
                'has_variable_pricing',
                'budget_estimate_min',
                'budget_estimate_max',
            )
        }),
        ('Features & Amenities', {
            'fields': ('amenities', 'organizer_notes')
        }),
        ('Details & Media', {
            'fields': ('image', 'image_url', 'virtual_tour_url', 'rating')
        }),
        ('Scheduling', {
            'fields': ('preferred_dates',)
        }),
        ('Agent Information', {
            'classes': ('collapse',),
            'fields': ('agent_name', 'agent_avatar_url', 'agent_organization')
        }),
        ('Geospatial', {
            'classes': ('collapse',),
            'fields': ('latitude', 'longitude')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at', 'listed_date')
        }),
    )

    inlines = [
        LocationImageInline,
        FeatureInline,
        FloorPlanInline,
        VenueBookingInline,
        LocationReviewInline,
    ]

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" />', obj.image.url)
        return "No Image"

    image_preview.short_description = 'Image Preview'

# --- Register other models for basic admin management ---
admin.site.register(VenueBooking)
admin.site.register(LocationReview)
admin.site.register(Question)
admin.site.register(Wish)
admin.site.register(WaitlistEntry)
