from django.contrib import admin
from .models import Event, PromoCode
from tickets.models import Ticket
from artists.models import ArtistBooking
from vendors.models import Booking as VendorBooking
from locations.models import VenueBooking # Import the new VenueBooking model

# --- Inlines for Related Models ---

# Inline admin for PromoCode to show them within the Event page
class PromoCodeInline(admin.TabularInline):
    model = PromoCode
    extra = 1
    fields = ('code', 'discount_percentage', 'discount_amount', 'start_date', 'end_date', 'is_active')

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
    # Display these columns in the event list view
    list_display = ('name', 'user', 'date', 'start_time', 'venue', 'access_type')
    list_filter = ('date', 'access_type', 'user', 'is_seated')
    search_fields = ('name', 'user__username', 'venue')
    inlines = [PromoCodeInline, TicketInline]

    # Organize the admin form into logical sections based on your SQL schema
    fieldsets = (
        ('🗓️ Event Core Details', {
            'fields': (
                'name',
                ('date', 'start_time', 'end_time'),
                'venue',
                'location',
                'organizer',
                'partner_user'
            )
        }),
        ('🎨 Event Branding & Info', {
            'classes': ('collapse',),
            'fields': ('category', 'theme', 'notes', 'banner_image', 'image_url', 'is_draft'),
        }),
        ('📦 Ticket Options', {
            'classes': ('collapse',),
            'fields': ('base_price', 'currency', 'max_tickets_per_buyer', 'tiered_prices', 'refund_policy'),
        }),
        ('🪑 Seating Options', {
            'classes': ('collapse',),
            'fields': ('is_seated', 'seating_chart'),
        }),
        ('🎟️ Audience & Access Controls', {
            'classes': ('collapse',),
            'fields': ('is_age_restricted', 'access_type', 'custom_questions'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def save_model(self, request, obj, form, change):
        """
        When creating a new event from the admin, automatically set the
        'user' field to the currently logged-in user.
        """
        # If the object is new (it has no primary key yet)
        if not obj.pk:
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'event', 'discount_percentage', 'discount_amount', 'start_date', 'end_date', 'is_active')
    list_filter = ('event', 'is_active')
    search_fields = ('code', 'event__name')