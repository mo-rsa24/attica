from django.contrib.auth import logout
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from users.models import CustomUser, UserProfile
from users.serializers import RegisterSerializer, UserSerializer, UserProfileSerializer


class RegisterAPIView(generics.CreateAPIView):
    """API endpoint for registering a new user."""

    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token = TokenObtainPairSerializer.get_token(user)
        data = {
            "access": str(token.access_token),
            "refresh": str(token),
            "user": UserSerializer(user).data,
        }
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Return user details and roles along with the tokens."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


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

class ProfileUpdateAPIView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileView(APIView):
    """
    View to retrieve and update the profile of the currently logged-in user.
    """
    # Ensures that only authenticated users can access this view.
    permission_classes = [IsAuthenticated]
    # Parsers to handle file uploads (for the profile picture).
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        """
        Handles GET requests to fetch the user's profile data.
        """
        # request.user is the authenticated user instance.
        # We get the related UserProfile.
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, *args, **kwargs):
        """
        Handles PUT requests to update the user's profile data.
        """
        try:
            profile = UserProfile.objects.get(user=request.user)
            # We pass the instance to the serializer to tell it we're updating.
            # `request.data` contains the submitted form data.
            # `partial=True` allows for partial updates (e.g., only updating the bio).
            serializer = UserProfileSerializer(instance=profile, data=request.data, partial=True)

            if serializer.is_valid():
                # The custom update logic in the serializer handles saving the nested user data.
                serializer.save()

                # Manually handle the profile picture update if a new one was uploaded.
                if 'profile_picture' in request.FILES:
                    profile.profile_picture = request.FILES['profile_picture']
                    profile.save()

                # We need to re-serialize the instance to include the updated picture URL
                final_serializer = UserProfileSerializer(profile)
                return Response(final_serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)