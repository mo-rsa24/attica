from django.contrib import admin
from .models import Vendor, Service, Category, Region, Amenity, VendorPost, Review, VendorProfile, Reservation, Booking

class ServiceInline(admin.TabularInline):
    model = Service
    extra = 1
    readonly_fields = ('rating',)
    verbose_name_plural = "Services Offered"

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ('user', 'service', 'rating', 'comment')
    can_delete = False
    verbose_name_plural = "Customer Reviews"

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'rating')
    list_filter = ('category',)
    search_fields = ('name', 'user__username', 'category__name')
    readonly_fields = ('rating',)
    autocomplete_fields = ['user', 'category']
    inlines = [ServiceInline]

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'category', 'price', 'rating')
    list_filter = ('category', 'regions', 'vendor')
    search_fields = ('name', 'vendor__name', 'category__name')
    readonly_fields = ('rating',)
    autocomplete_fields = ['vendor', 'category', 'amenities', 'regions', 'similar_services', 'likes']
    inlines = [ReviewInline]

@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'is_verified')
    list_filter = ('is_verified', 'province')
    search_fields = ('user__username', 'company_name', 'city')
    autocomplete_fields = ['user']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ['name']

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    search_fields = ['name']

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    search_fields = ['name']

admin.site.register(Reservation)
admin.site.register(Review)
admin.site.register(VendorPost)
admin.site.register(Booking)
