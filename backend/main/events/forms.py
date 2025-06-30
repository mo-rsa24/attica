from django import forms
from .models import Event

class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = ['name', 'date', 'start_time', 'end_time', 'guest_count', 'budget', 'location', 'notes']
        widgets = {
            'date': forms.SelectDateWidget(),
            'start_time': forms.TimeInput(attrs={'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'type': 'time'}),
        }