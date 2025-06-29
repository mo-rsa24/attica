# main/views.py
from django.views.generic import TemplateView

class ReactAppView(TemplateView):
    """Serve the compiled React app"""
    template_name = "index.html"
