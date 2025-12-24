from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('event', 'buyer', 'quantity', 'payment_status', 'created_at')
    list_filter = ('payment_status', 'event__name')
    search_fields = ('event__name', 'buyer__username', 'buyer__email')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    autocomplete_fields = ['event', 'buyer']
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Ticket Information', {
            'fields': ('event', 'buyer', 'quantity', 'payment_status')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
