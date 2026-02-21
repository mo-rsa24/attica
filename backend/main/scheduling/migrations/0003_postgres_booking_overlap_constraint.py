from django.db import migrations


CONSTRAINT_NAME = "scheduling_booking_no_overlap_active"


def add_postgres_exclusion_constraint(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")
        cursor.execute(
            f"""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = '{CONSTRAINT_NAME}'
                ) THEN
                    ALTER TABLE scheduling_booking
                    ADD CONSTRAINT {CONSTRAINT_NAME}
                    EXCLUDE USING gist (
                        resource_id WITH =,
                        tstzrange(start_at, end_at, '[)') WITH &&
                    )
                    WHERE (
                        status IN ('hold', 'confirmed', 'in_progress', 'reschedule_pending', 'disputed')
                    );
                END IF;
            END
            $$;
            """
        )


def remove_postgres_exclusion_constraint(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            f"ALTER TABLE scheduling_booking DROP CONSTRAINT IF EXISTS {CONSTRAINT_NAME};"
        )


class Migration(migrations.Migration):
    dependencies = [
        ("scheduling", "0002_outboxdeadletter"),
    ]

    operations = [
        migrations.RunPython(
            add_postgres_exclusion_constraint,
            reverse_code=remove_postgres_exclusion_constraint,
        ),
    ]
