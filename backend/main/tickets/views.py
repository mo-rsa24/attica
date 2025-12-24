from rest_framework import viewsets, permissions
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def get_queryset(self):
        # Users should only see their own tickets
        return self.queryset.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)