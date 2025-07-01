from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.views.generic import CreateView
from rest_framework import generics, permissions
from rest_framework.reverse import reverse, reverse_lazy

from users.forms import CustomUserCreationForm
from users.models import CustomUser
from users.serializers import UserSerializer


class CustomUserRegisterView(CreateView):
    model = CustomUser
    form_class = CustomUserCreationForm
    template_name = 'registration/register.html'
    success_url = reverse_lazy('login')

@login_required
def login_required(request):
    if request.user.user_type == 'organizer':
        return redirect('event_explore')
    elif request.user.user_type == 'vendor':
        return redirect('vendor_explore') # Come back for vendor dashboard
    return redirect('index')

class CurrentUserAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user