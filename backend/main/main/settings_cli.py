from .settings import *  # noqa

# Work around broken third-party site-packages logging import paths in local env.
LOGGING_CONFIG = None
LOGGING = {}

# Keep CLI management commands operational in constrained local environments.
INSTALLED_APPS = [
    app
    for app in INSTALLED_APPS
    if app not in {"channels", "django_filters", "django_extensions"}
]

# Avoid importing unrelated URL modules that rely on unavailable optional deps.
ROOT_URLCONF = "scheduling.test_urls"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "scheduling-cli-cache",
    }
}
