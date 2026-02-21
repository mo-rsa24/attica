from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from artists.models import Artist
from users.models import Role, UserProfile


User = get_user_model()


ARTISTS = [
    {
        "name": "Kabza De Small",
        "username": "kabza.desmall",
        "email": "kabza.desmall@artist.attica.test",
        "genres": "Amapiano, DJ",
        "booking_fee": Decimal("120000.00"),
        "instagram_handle": "@kabelomotha_",
        "is_popular": True,
    },
    {
        "name": "DJ Maphorisa",
        "username": "dj.maphorisa",
        "email": "dj.maphorisa@artist.attica.test",
        "genres": "Amapiano, Hip-Hop, DJ",
        "booking_fee": Decimal("150000.00"),
        "instagram_handle": "@djmaphorisa",
        "is_popular": True,
    },
    {
        "name": "Uncle Waffles",
        "username": "uncle.waffles",
        "email": "uncle.waffles@artist.attica.test",
        "genres": "Amapiano, DJ",
        "booking_fee": Decimal("180000.00"),
        "instagram_handle": "@unclewaffffles",
        "is_popular": True,
    },
    {
        "name": "Focalistic",
        "username": "focalistic",
        "email": "focalistic@artist.attica.test",
        "genres": "Amapiano, Hip-Hop",
        "booking_fee": Decimal("90000.00"),
        "instagram_handle": "@focalistic",
        "is_popular": True,
    },
    {
        "name": "Nasty C",
        "username": "nasty.c",
        "email": "nasty.c@artist.attica.test",
        "genres": "Hip-Hop",
        "booking_fee": Decimal("140000.00"),
        "instagram_handle": "@nasty_csa",
        "is_popular": True,
    },
    {
        "name": "Cassper Nyovest",
        "username": "cassper.nyovest",
        "email": "cassper.nyovest@artist.attica.test",
        "genres": "Hip-Hop",
        "booking_fee": Decimal("160000.00"),
        "instagram_handle": "@casspernyovest",
        "is_popular": True,
    },
    {
        "name": "K.O",
        "username": "ko.sa",
        "email": "ko.sa@artist.attica.test",
        "genres": "Hip-Hop",
        "booking_fee": Decimal("80000.00"),
        "instagram_handle": "@mrcashtime",
        "is_popular": True,
    },
    {
        "name": "Blxckie",
        "username": "blxckie",
        "email": "blxckie@artist.attica.test",
        "genres": "Hip-Hop, Trap",
        "booking_fee": Decimal("70000.00"),
        "instagram_handle": "@blxckie___",
        "is_popular": True,
    },
    {
        "name": "Sun-El Musician",
        "username": "sunel.musician",
        "email": "sunel.musician@artist.attica.test",
        "genres": "3-Step, Afro-House, DJ",
        "booking_fee": Decimal("110000.00"),
        "instagram_handle": "@sunelmusician",
        "is_popular": True,
    },
    {
        "name": "Da Capo",
        "username": "da.capo",
        "email": "da.capo@artist.attica.test",
        "genres": "3-Step, Afro-House, DJ",
        "booking_fee": Decimal("95000.00"),
        "instagram_handle": "@dacapo_sa",
        "is_popular": True,
    },
    {
        "name": "Thakzin",
        "username": "thakzin.sa",
        "email": "thakzin.sa@artist.attica.test",
        "genres": "3-Step, Afro-Tech, DJ",
        "booking_fee": Decimal("88000.00"),
        "instagram_handle": "@thakzin_",
        "is_popular": True,
    },
    {
        "name": "DBN Gogo",
        "username": "dbn.gogo",
        "email": "dbn.gogo@artist.attica.test",
        "genres": "Amapiano, DJ",
        "booking_fee": Decimal("125000.00"),
        "instagram_handle": "@dbngogo",
        "is_popular": True,
    },
    {
        "name": "Kamo Mphela",
        "username": "kamo.mphela",
        "email": "kamo.mphela@artist.attica.test",
        "genres": "Amapiano, Dancer",
        "booking_fee": Decimal("100000.00"),
        "instagram_handle": "@kamo_mphelaxx",
        "is_popular": True,
    },
    {
        "name": "Bontle Modiselle",
        "username": "bontle.modiselle",
        "email": "bontle.modiselle@artist.attica.test",
        "genres": "Dancer, Choreographer",
        "booking_fee": Decimal("65000.00"),
        "instagram_handle": "@bontle.modiselle",
        "is_popular": True,
    },
    {
        "name": "Robot Boii",
        "username": "robot.boii",
        "email": "robot.boii@artist.attica.test",
        "genres": "Dancer, Amapiano",
        "booking_fee": Decimal("60000.00"),
        "instagram_handle": "@robot_boii",
        "is_popular": True,
    },
    {
        "name": "Tarryn Alberts",
        "username": "tarryn.alberts",
        "email": "tarryn.alberts@artist.attica.test",
        "genres": "Choreographer, Dance Director",
        "booking_fee": Decimal("55000.00"),
        "instagram_handle": "@tarrynalberts",
        "is_popular": True,
    },
    {
        "name": "Dr Tumi",
        "username": "dr.tumi",
        "email": "dr.tumi@artist.attica.test",
        "genres": "Gospel",
        "booking_fee": Decimal("85000.00"),
        "instagram_handle": "@drtumi_",
        "is_popular": True,
    },
    {
        "name": "Benjamin Dube",
        "username": "benjamin.dube",
        "email": "benjamin.dube@artist.attica.test",
        "genres": "Gospel",
        "booking_fee": Decimal("90000.00"),
        "instagram_handle": "@benjamindubeofficial",
        "is_popular": True,
    },
    {
        "name": "Ntokozo Mbambo",
        "username": "ntokozo.mbambo",
        "email": "ntokozo.mbambo@artist.attica.test",
        "genres": "Gospel, Worship",
        "booking_fee": Decimal("70000.00"),
        "instagram_handle": "@ntokozombambo",
        "is_popular": True,
    },
    {
        "name": "Hlengiwe Mhlaba",
        "username": "hlengiwe.mhlaba",
        "email": "hlengiwe.mhlaba@artist.attica.test",
        "genres": "Gospel",
        "booking_fee": Decimal("68000.00"),
        "instagram_handle": "@hlengiwemhlabaofficial",
        "is_popular": True,
    },
]


class Command(BaseCommand):
    help = "Seed 20 South African artists with role-linked users for testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="password",
            help="Password for all seeded artist users (default: password).",
        )

    def handle(self, *args, **options):
        password = options["password"]
        artist_role, _ = Role.objects.get_or_create(name=Role.Names.ARTIST)

        created = 0
        updated = 0

        for payload in ARTISTS:
            name_parts = payload["name"].split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            user, user_created = User.objects.update_or_create(
                username=payload["username"],
                defaults={
                    "email": payload["email"],
                    "first_name": first_name,
                    "last_name": last_name,
                    "user_type": "artist",
                    "is_staff": False,
                    "is_superuser": False,
                },
            )
            user.set_password(password)
            user.save()
            user.roles.add(artist_role)

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.bio = (
                f"{payload['name']} is a South African {payload['genres']} performer available for bookings."
            )
            profile.save()

            _, artist_created = Artist.objects.update_or_create(
                user=user,
                owner=user,
                defaults={
                    "name": payload["name"],
                    "bio": (
                        f"{payload['name']} is a South African {payload['genres']} act "
                        "known for high-energy live performances."
                    ),
                    "genres": payload["genres"],
                    "booking_fee": payload["booking_fee"],
                    "contact_email": payload["email"],
                    "phone_number": "+27 11 555 0101",
                    "instagram_handle": payload["instagram_handle"],
                    "is_popular": payload["is_popular"],
                },
            )

            if user_created or artist_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: {created} created, {updated} updated, total {len(ARTISTS)} artists processed."
            )
        )
