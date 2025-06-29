# main/views.py
from django.shortcuts import render
from django.views.generic import TemplateView
def index(request):
    """Renders the project landing page."""
    return render(request, 'index.html')



class ReactAppView(TemplateView):
    """Serve the compiled React app"""
    template_name = "index.html"