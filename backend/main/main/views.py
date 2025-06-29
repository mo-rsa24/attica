# main/views.py
from django.shortcuts import render

def index(request):
    """Renders the project landing page."""
    return render(request, 'index.html')
