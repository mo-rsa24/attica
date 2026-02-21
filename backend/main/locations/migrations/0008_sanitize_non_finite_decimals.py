from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0007_amenity_location_budget_estimate_max_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                UPDATE locations_location
                SET price = 0
                WHERE lower(CAST(price AS TEXT)) IN ('nan', 'inf', '-inf', 'infinity', '-infinity');

                UPDATE locations_location
                SET rating = 0
                WHERE lower(CAST(rating AS TEXT)) IN ('nan', 'inf', '-inf', 'infinity', '-infinity');

                UPDATE locations_location
                SET latitude = NULL
                WHERE lower(CAST(latitude AS TEXT)) IN ('nan', 'inf', '-inf', 'infinity', '-infinity');

                UPDATE locations_location
                SET longitude = NULL
                WHERE lower(CAST(longitude AS TEXT)) IN ('nan', 'inf', '-inf', 'infinity', '-infinity');

                UPDATE locations_location
                SET budget_estimate_min = NULL
                WHERE lower(CAST(budget_estimate_min AS TEXT)) IN ('nan', 'inf', '-inf', 'infinity', '-infinity');

                UPDATE locations_location
                SET budget_estimate_max = NULL
                WHERE lower(CAST(budget_estimate_max AS TEXT)) IN ('nan', 'inf', '-inf', 'infinity', '-infinity');
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
