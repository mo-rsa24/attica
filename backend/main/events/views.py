from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import CreateView, ListView, UpdateView, DeleteView

from .models import Event
from .forms import EventForm


class EventCreateView(LoginRequiredMixin, CreateView):
    model = Event
    form_class = EventForm
    template_name = 'events/event_form.html'
    success_url = reverse_lazy('event_explore')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

class EventListView(LoginRequiredMixin, ListView):
    model = Event
    template_name = "events/event_list.html" # Template to render
    context_object_name = 'events' # Name of the variable in the template

    def get_queryset(self):
        # Fetch events created by the logged-in user
        return Event.objects.filter(user=self.request.user)

class EventUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Event
    form_class = EventForm
    template_name = 'events/event_form.html'
    success_url = reverse_lazy('event_explore')

    def test_func(self):
        event = self.get_object()
        return event.user == self.request.user

class EventDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Event
    template_name = "events/event_confirm_delete.html"
    success_url = reverse_lazy('event_explore')

    def test_func(self):
        event = self.get_object()
        return event.user == self.request.user