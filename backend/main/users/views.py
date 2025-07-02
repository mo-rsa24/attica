from django.contrib.auth import logout
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import CustomUser
from users.serializers import RegisterSerializer, UserSerializer


class RegisterAPIView(generics.CreateAPIView):
    """API endpoint for registering a new user."""

    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LogoutAPIView(APIView):
    """Log out the current authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out"})

class CurrentUserAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user