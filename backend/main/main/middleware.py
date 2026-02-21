import logging


logger = logging.getLogger("django.request")


class ApiMethodDebugMiddleware:
    """
    Adds actionable diagnostics for API method errors (especially 405).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        path = request.path or ""
        is_profile_path = path.startswith("/api/accounts/profile/")
        is_api = path.startswith("/api/")
        is_method_error = response.status_code == 405

        if is_api and (is_method_error or is_profile_path):
            match = getattr(request, "resolver_match", None)
            view_name = getattr(match, "view_name", None)
            route = getattr(match, "route", None)
            func = getattr(match, "func", None)
            func_name = None
            if func is not None:
                module = getattr(func, "__module__", "")
                name = getattr(func, "__name__", str(func))
                func_name = f"{module}.{name}" if module else name

            allow = response.headers.get("Allow", "") if hasattr(response, "headers") else ""
            user = getattr(request, "user", None)
            user_repr = getattr(user, "username", "anonymous") if getattr(user, "is_authenticated", False) else "anonymous"

            logger.warning(
                (
                    "API debug | method=%s path=%s status=%s allow=%s "
                    "view_name=%s route=%s func=%s user=%s"
                ),
                request.method,
                path,
                response.status_code,
                allow,
                view_name,
                route,
                func_name,
                user_repr,
            )

        return response
