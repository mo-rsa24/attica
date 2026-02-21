from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from locations.models import Amenity, Feature, Location
from vendors.models import Region


User = get_user_model()


AMENITIES = [
    "Parking",
    "Wi-Fi",
    "Stage",
    "Sound System",
    "Catering Kitchen",
    "Security",
    "Generator Backup",
    "VIP Lounge",
    "Wheelchair Access",
]


VENUE_PAYLOADS = [
    {
        "name": "FNB Stadium",
        "category": "concert",
        "address": "Soccer City Avenue, Nasrec, Johannesburg, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 85000,
        "price": "450000.00",
        "rating": "4.70",
        "is_featured": True,
        "is_indoor": False,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "On-site parking and shuttle routes available.",
        "budget_min": "300000.00",
        "budget_max": "900000.00",
        "latitude": -26.234778,
        "longitude": 27.982222,
        "features": ["Concert", "Outdoor", "Festival-ready"],
    },
    {
        "name": "SunBet Arena at Time Square",
        "category": "concert",
        "address": "209 Aramist Avenue, Menlyn, Pretoria, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 8500,
        "price": "180000.00",
        "rating": "4.50",
        "is_featured": True,
        "is_indoor": True,
        "is_outdoor": False,
        "is_wheelchair_accessible": True,
        "parking_info": "Secure casino complex parking with overflow nearby.",
        "budget_min": "120000.00",
        "budget_max": "400000.00",
        "latitude": -25.785189,
        "longitude": 28.275274,
        "features": ["Concert", "Indoor", "VIP Friendly"],
    },
    {
        "name": "Cape Town International Convention Centre",
        "category": "corporate",
        "address": "1 Lower Long Street, Cape Town CBD, Western Cape, South Africa",
        "region": "Western Cape",
        "capacity": 11000,
        "price": "220000.00",
        "rating": "4.60",
        "is_featured": True,
        "is_indoor": True,
        "is_outdoor": False,
        "is_wheelchair_accessible": True,
        "parking_info": "Underground parking plus nearby public garages.",
        "budget_min": "90000.00",
        "budget_max": "450000.00",
        "latitude": -33.915980,
        "longitude": 18.427756,
        "features": ["Corporate", "Conference", "Exhibition"],
    },
    {
        "name": "Durban International Convention Centre",
        "category": "corporate",
        "address": "45 Bram Fischer Road, Durban Central, KwaZulu-Natal, South Africa",
        "region": "KwaZulu-Natal",
        "capacity": 10000,
        "price": "200000.00",
        "rating": "4.50",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": False,
        "is_wheelchair_accessible": True,
        "parking_info": "Multi-level parking and valet options for major events.",
        "budget_min": "85000.00",
        "budget_max": "420000.00",
        "latitude": -29.857538,
        "longitude": 31.024197,
        "features": ["Corporate", "Conference", "Product Launch"],
    },
    {
        "name": "GrandWest Grand Arena",
        "category": "concert",
        "address": "1 Jakes Gerwel Drive, Goodwood, Cape Town, Western Cape, South Africa",
        "region": "Western Cape",
        "capacity": 5600,
        "price": "135000.00",
        "rating": "4.40",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": False,
        "is_wheelchair_accessible": True,
        "parking_info": "Large entertainment complex parking with security.",
        "budget_min": "70000.00",
        "budget_max": "260000.00",
        "latitude": -33.923300,
        "longitude": 18.541560,
        "features": ["Concert", "Indoor", "Live Performance"],
    },
    {
        "name": "Moses Mabhida Stadium",
        "category": "festival",
        "address": "44 Isaiah Ntshangase Road, Stamford Hill, Durban, KwaZulu-Natal, South Africa",
        "region": "KwaZulu-Natal",
        "capacity": 56000,
        "price": "280000.00",
        "rating": "4.60",
        "is_featured": True,
        "is_indoor": False,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Extensive perimeter parking and event transport links.",
        "budget_min": "180000.00",
        "budget_max": "700000.00",
        "latitude": -29.830410,
        "longitude": 31.030580,
        "features": ["Festival", "Outdoor", "Concert"],
    },
    {
        "name": "Loftus Versfeld Stadium",
        "category": "concert",
        "address": "440 Kirkness Street, Arcadia, Pretoria, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 51762,
        "price": "250000.00",
        "rating": "4.40",
        "is_featured": False,
        "is_indoor": False,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Street and managed-event parking in surrounding precinct.",
        "budget_min": "160000.00",
        "budget_max": "600000.00",
        "latitude": -25.753174,
        "longitude": 28.221762,
        "features": ["Concert", "Outdoor", "Stadium Scale"],
    },
    {
        "name": "Artscape Opera House",
        "category": "concert",
        "address": "DF Malan Street, Foreshore, Cape Town, Western Cape, South Africa",
        "region": "Western Cape",
        "capacity": 1500,
        "price": "70000.00",
        "rating": "4.50",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": False,
        "is_wheelchair_accessible": True,
        "parking_info": "Nearby city parking garages and event drop-off.",
        "budget_min": "35000.00",
        "budget_max": "140000.00",
        "latitude": -33.918610,
        "longitude": 18.430220,
        "features": ["Theatre", "Indoor", "Concert"],
    },
    {
        "name": "The Lyric Theatre, Gold Reef City",
        "category": "concert",
        "address": "Northern Parkway & Data Crescent, Ormonde, Johannesburg, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 1100,
        "price": "65000.00",
        "rating": "4.40",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": False,
        "is_wheelchair_accessible": True,
        "parking_info": "Secure theme-park complex parking.",
        "budget_min": "30000.00",
        "budget_max": "125000.00",
        "latitude": -26.236370,
        "longitude": 28.010500,
        "features": ["Theatre", "Indoor", "Live Show"],
    },
    {
        "name": "Konka Soweto",
        "category": "club",
        "address": "1804 Chris Hani Road, Pimville, Soweto, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 1200,
        "price": "85000.00",
        "rating": "4.30",
        "is_featured": True,
        "is_indoor": False,
        "is_outdoor": True,
        "is_wheelchair_accessible": False,
        "parking_info": "Controlled event parking with private marshals.",
        "budget_min": "45000.00",
        "budget_max": "170000.00",
        "latitude": -26.269200,
        "longitude": 27.861100,
        "features": ["Club", "Amapiano", "Outdoor Lounge"],
    },
    {
        "name": "Cabo Beach Club",
        "category": "club",
        "address": "19a Kloof Road, Clifton, Cape Town, Western Cape, South Africa",
        "region": "Western Cape",
        "capacity": 900,
        "price": "95000.00",
        "rating": "4.20",
        "is_featured": True,
        "is_indoor": False,
        "is_outdoor": True,
        "is_wheelchair_accessible": False,
        "parking_info": "Valet and premium parking at nearby bays.",
        "budget_min": "50000.00",
        "budget_max": "200000.00",
        "latitude": -33.936830,
        "longitude": 18.374420,
        "features": ["Club", "Beachfront", "VIP Lounge"],
    },
    {
        "name": "Summer Place, Hyde Park",
        "category": "wedding",
        "address": "69 Melville Road, Hyde Park, Sandton, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 400,
        "price": "120000.00",
        "rating": "4.70",
        "is_featured": True,
        "is_indoor": True,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "On-site parking for guests with overflow options.",
        "budget_min": "70000.00",
        "budget_max": "250000.00",
        "latitude": -26.124900,
        "longitude": 28.036300,
        "features": ["Wedding", "Garden Ceremony", "Reception Hall"],
    },
    {
        "name": "Oakfield Farm",
        "category": "wedding",
        "address": "Beyers Naude Drive, Honeydew, Johannesburg, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 300,
        "price": "105000.00",
        "rating": "4.50",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Estate parking and shuttle-friendly access roads.",
        "budget_min": "60000.00",
        "budget_max": "220000.00",
        "latitude": -26.088100,
        "longitude": 27.920200,
        "features": ["Wedding", "Country Estate", "Photo Friendly"],
    },
    {
        "name": "Nutting House Lodge",
        "category": "wedding",
        "address": "9 Edward Avenue, Muldersdrift, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 250,
        "price": "88000.00",
        "rating": "4.40",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Private secure parking inside lodge grounds.",
        "budget_min": "50000.00",
        "budget_max": "180000.00",
        "latitude": -26.022800,
        "longitude": 27.864900,
        "features": ["Wedding", "Lodge", "Intimate"],
    },
    {
        "name": "Laurent at Lourensford",
        "category": "wedding",
        "address": "Lourensford Wine Estate, Somerset West, Western Cape, South Africa",
        "region": "Western Cape",
        "capacity": 280,
        "price": "98000.00",
        "rating": "4.60",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Estate parking with dedicated wedding coordinator support.",
        "budget_min": "60000.00",
        "budget_max": "210000.00",
        "latitude": -34.079500,
        "longitude": 18.881900,
        "features": ["Wedding", "Winelands", "Garden Ceremony"],
    },
    {
        "name": "The Forum Embassy Hill",
        "category": "corporate",
        "address": "32 Empire Road, Parktown, Johannesburg, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 600,
        "price": "130000.00",
        "rating": "4.50",
        "is_featured": True,
        "is_indoor": True,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Dedicated on-site parking with event marshals.",
        "budget_min": "75000.00",
        "budget_max": "260000.00",
        "latitude": -26.182800,
        "longitude": 28.030500,
        "features": ["Corporate", "Wedding", "Premium"],
    },
    {
        "name": "Boardwalk ICC",
        "category": "corporate",
        "address": "2nd Avenue, Summerstrand, Gqeberha, Eastern Cape, South Africa",
        "region": "Eastern Cape",
        "capacity": 2000,
        "price": "90000.00",
        "rating": "4.30",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": False,
        "is_wheelchair_accessible": True,
        "parking_info": "Casino complex parking and coastal access roads.",
        "budget_min": "45000.00",
        "budget_max": "180000.00",
        "latitude": -33.981600,
        "longitude": 25.653800,
        "features": ["Corporate", "Conference", "Expo"],
    },
    {
        "name": "Imbali Skyline Pavilion",
        "category": "festival",
        "address": "42 Skyline Drive, Midrand, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 3200,
        "price": "140000.00",
        "rating": "4.20",
        "is_featured": False,
        "is_indoor": False,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Temporary event parking with shuttle loops.",
        "budget_min": "80000.00",
        "budget_max": "280000.00",
        "latitude": -25.981700,
        "longitude": 28.125800,
        "features": ["Festival", "Outdoor", "Pop-up Venue"],
    },
    {
        "name": "uMhlanga Bay Events Deck",
        "category": "wedding",
        "address": "15 Lagoon Drive, uMhlanga, KwaZulu-Natal, South Africa",
        "region": "KwaZulu-Natal",
        "capacity": 450,
        "price": "112000.00",
        "rating": "4.30",
        "is_featured": False,
        "is_indoor": True,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "Basement parking and public beachfront overflow lots.",
        "budget_min": "65000.00",
        "budget_max": "230000.00",
        "latitude": -29.726500,
        "longitude": 31.085200,
        "features": ["Wedding", "Beachfront", "Reception"],
    },
    {
        "name": "Kyalami Grand Prix Circuit & International Convention Centre",
        "category": "festival",
        "address": "Cnr R55 & Allandale Road, Kyalami, Midrand, Gauteng, South Africa",
        "region": "Gauteng",
        "capacity": 25000,
        "price": "240000.00",
        "rating": "4.50",
        "is_featured": True,
        "is_indoor": True,
        "is_outdoor": True,
        "is_wheelchair_accessible": True,
        "parking_info": "High-capacity controlled parking for large-scale events.",
        "budget_min": "150000.00",
        "budget_max": "500000.00",
        "latitude": -25.997700,
        "longitude": 28.074100,
        "features": ["Festival", "Corporate", "Motorsport Venue"],
    },
]


class Command(BaseCommand):
    help = "Seed 20 South African event venues across weddings, clubs, concerts, and corporate categories."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="password",
            help="Password for the seeded venue owner account (default: password).",
        )

    def handle(self, *args, **options):
        owner = self._get_or_create_owner(password=options["password"])
        amenity_map = self._seed_amenities()

        created = 0
        updated = 0

        for payload in VENUE_PAYLOADS:
            region = self._get_or_create_region(payload["region"])
            listed_date = timezone.now()
            venue, was_created = Location.objects.update_or_create(
                name=payload["name"],
                defaults={
                    "owner": owner,
                    "agent": owner,
                    "agent_name": "Attica Venue Desk",
                    "agent_organization": "Attica Venue Partners",
                    "name": payload["name"],
                    "address": payload["address"],
                    "region": region,
                    "capacity": payload["capacity"],
                    "is_approved": True,
                    "venue_count": max(15, payload["capacity"] // 40),
                    "rating": Decimal(payload["rating"]),
                    "listed_date": listed_date,
                    "price": Decimal(payload["price"]),
                    "image_url": "",
                    "is_featured": payload["is_featured"],
                    "has_variable_pricing": payload["category"] in {"festival", "corporate"},
                    "parking_info": payload["parking_info"],
                    "is_wheelchair_accessible": payload["is_wheelchair_accessible"],
                    "budget_estimate_min": Decimal(payload["budget_min"]),
                    "budget_estimate_max": Decimal(payload["budget_max"]),
                    "organizer_notes": (
                        f"Category: {payload['category']}. Suitable for {', '.join(payload['features']).lower()} events."
                    ),
                    "preferred_dates": [
                        {"start": "2026-09-01", "end": "2026-12-15"},
                        {"start": "2027-01-10", "end": "2027-04-30"},
                    ],
                    "is_indoor": payload["is_indoor"],
                    "is_outdoor": payload["is_outdoor"],
                    "latitude": Decimal(str(payload["latitude"])),
                    "longitude": Decimal(str(payload["longitude"])),
                },
            )

            if was_created:
                created += 1
            else:
                updated += 1

            venue.amenities.set(
                [amenity_map[name] for name in self._amenities_for_category(payload["category"])]
            )

            venue.features.all().delete()
            for feature_name in payload["features"]:
                Feature.objects.create(location=venue, name=feature_name)

        total = len(VENUE_PAYLOADS)
        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: {total} venues processed ({created} created, {updated} updated)."
            )
        )

    def _get_or_create_owner(self, password):
        user, _ = User.objects.get_or_create(
            username="venue.seed.bot",
            defaults={
                "email": "venue.seed.bot@attica.test",
                "first_name": "Venue",
                "last_name": "Seeder",
                "user_type": "venue",
                "is_staff": False,
                "is_superuser": False,
            },
        )
        user.set_password(password)
        user.save()
        return user

    def _seed_amenities(self):
        amenities = {}
        for amenity_name in AMENITIES:
            amenity, _ = Amenity.objects.get_or_create(name=amenity_name)
            amenities[amenity_name] = amenity
        return amenities

    def _get_or_create_region(self, name):
        region, _ = Region.objects.get_or_create(
            slug=slugify(name),
            defaults={"name": name},
        )
        if region.name != name:
            region.name = name
            region.save(update_fields=["name"])
        return region

    def _amenities_for_category(self, category):
        base = ["Parking", "Wi-Fi", "Security"]
        category_map = {
            "wedding": ["Catering Kitchen", "Wheelchair Access"],
            "club": ["Sound System", "VIP Lounge"],
            "concert": ["Stage", "Sound System", "Wheelchair Access"],
            "festival": ["Stage", "Generator Backup", "Sound System"],
            "corporate": ["Stage", "Generator Backup", "Wheelchair Access"],
        }
        return base + category_map.get(category, [])
