from django.contrib import admin
from django.utils.html import format_html

from .models import Artist, ArtistPortfolioItem, Follow, ArtistBooking, ArtistPost

# --- Inlines for Related Models ---

class ArtistPortfolioItemInline(admin.TabularInline):
    model = ArtistPortfolioItem
    extra = 1
    readonly_fields = ('created_at',)
    verbose_name_plural = "Portfolio Items"

class ArtistPostInline(admin.StackedInline):
    model = ArtistPost
    extra = 1
    readonly_fields = ('created_at',)
    verbose_name_plural = "Posts"
    classes = ('collapse',)

class FollowerInline(admin.TabularInline):
    model = Follow
    extra = 0
    readonly_fields = ('user', 'created_at')
    can_delete = False
    verbose_name_plural = "Followers"

class ArtistBookingInline(admin.TabularInline):
    """
    An inline to show all event bookings for the artist.
    CORRECTED: Removed start_time and end_time, added date_booked.
    """
    model = ArtistBooking
    extra = 0
    # The fields now correctly match the ArtistBooking model
    readonly_fields = ('event', 'date_booked', 'status')
    can_delete = False
    verbose_name_plural = "Event Bookings"
    autocomplete_fields = ['event']


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    """
    A comprehensive admin interface for the enriched Artist model.
    """
    # ENHANCED: Added image preview, booking fee, and popularity status to the list view.
    list_display = ('image_preview', 'name', 'genres', 'booking_fee', 'rating', 'is_popular')
    list_filter = ('genres', 'is_popular')
    search_fields = ('name', 'owner__username', 'genres')
    readonly_fields = ('created_at', 'updated_at', 'rating')
    autocomplete_fields = ['owner', 'user']

    # ENHANCED: Organized the edit page into logical sections for better usability.
    fieldsets = (
        ('Primary Information', {
            'fields': ('name', 'owner', 'user', 'profile_image', 'is_popular')
        }),
        ('Artist Details', {
            'fields': ('bio', 'genres', 'rating')
        }),
        ('Booking & Contact Details', {
            'fields': ('booking_fee', 'contact_email', 'phone_number')
        }),
        ('Social Media', {
            'fields': ('instagram_handle',)
        }),
        ('Scheduling', {
            'classes': ('collapse',),
            'fields': ('availability',),
            'description': 'Use JSON format to specify unavailable dates, e.g., {"2024-12-25": "unavailable"}'
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )

    inlines = [
        ArtistPortfolioItemInline,
        ArtistBookingInline,
        FollowerInline,
        ArtistPostInline
    ]

    def image_preview(self, obj):
        """Creates a small image preview in the admin list view."""
        if obj.profile_image:
            return format_html('<img src="{}" width="60" height="60" style="border-radius: 50%; object-fit: cover;" />', obj.profile_image.url)
        return "No Image"
    image_preview.short_description = 'Profile Image'


@admin.register(ArtistBooking)
class ArtistBookingAdmin(admin.ModelAdmin):
    """
    Admin view for managing all artist bookings centrally.
    CORRECTED: Replaced start_time with date_booked.
    """
    list_display = ('artist', 'event', 'date_booked', 'status')
    list_filter = ('status', 'artist', 'event')
    search_fields = ('artist__name', 'event__name')
    autocomplete_fields = ['artist', 'event']
# Register other artist-related models for basic admin management
admin.site.register(ArtistPost)
admin.site.register(Follow)
admin.site.register(ArtistPortfolioItem)
