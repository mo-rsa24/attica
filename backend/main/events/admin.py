from django.contrib import admin
from .models import Event
from tickets.models import Ticket
from artists.models import ArtistBooking
from vendors.models import Booking as VendorBooking
from locations.models import VenueBooking # Import the new VenueBooking model

# --- Inlines for Related Models ---

class TicketInline(admin.TabularInline):
    model = Ticket
    extra = 0
    readonly_fields = ('buyer', 'quantity', 'payment_status', 'created_at')
    can_delete = False
    verbose_name_plural = "Tickets Sold"
    autocomplete_fields = ['buyer']

class ArtistBookingInline(admin.TabularInline):
    model = ArtistBooking
    extra = 1
    autocomplete_fields = ['artist']
    verbose_name_plural = "Artist Bookings"

class VendorBookingInline(admin.TabularInline):
    model = VendorBooking
    extra = 1
    autocomplete_fields = ['service']
    verbose_name_plural = "Vendor Bookings"

class VenueBookingInline(admin.TabularInline):
    """A read-only inline to show the venue booked for this event."""
    model = VenueBooking
    extra = 0
    max_num = 1 # An event can only have one venue booking
    readonly_fields = ('location', 'start_date', 'end_date', 'status')
    can_delete = False
    verbose_name_plural = "Venue Booking"

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'organizer', 'location', 'date', 'category', 'is_draft')
    list_filter = ('is_draft', 'category', 'date', 'location')
    search_fields = ('name', 'theme', 'category', 'organizer__username', 'location__name')
    ordering = ('-date',)
    date_hierarchy = 'date'

    autocomplete_fields = ['organizer', 'partner_user', 'location']
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Core Information', {
            'fields': ('name', 'organizer', 'partner_user', 'category', 'is_draft')
        }),
        ('Date & Time', {
            'fields': ('date', 'start_time', 'end_date', 'end_time')
        }),
        ('Venue & Logistics', {
            'fields': ('location', 'venue', 'guest_count', 'budget')
        }),
        ('Details & Appearance', {
            'classes': ('collapse',),
            'fields': ('theme', 'notes', 'image_url', 'banner_image')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )

    inlines = [
        VenueBookingInline, # Added Venue Booking
        ArtistBookingInline,
        VendorBookingInline,
        TicketInline,
    ]
