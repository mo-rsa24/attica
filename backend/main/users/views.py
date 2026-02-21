from django.contrib.auth import logout
from django.db.models import Count, F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from users.models import CustomUser, UserProfile, SocialPost, SocialPostComment
from users.serializers import (
    RegisterSerializer,
    UserSerializer,
    UserProfileSerializer,
    SocialPostSerializer,
    SocialPostCommentSerializer,
)


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

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, *args, **kwargs):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(instance=profile, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()

                # Keep both UserProfile and CustomUser avatars aligned for navbar/profile surfaces.
                if 'profile_picture' in request.FILES:
                    uploaded_picture = request.FILES['profile_picture']
                    profile.profile_picture = uploaded_picture
                    profile.save()
                    request.user.profile_picture = uploaded_picture
                    request.user.save(update_fields=['profile_picture'])

                final_serializer = UserProfileSerializer(profile)
                return Response(final_serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


class SocialPostListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = SocialPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return (
            SocialPost.objects
            .select_related("user")
            .prefetch_related("user__roles", "likes")
            .annotate(
                likes_total=Count("likes", distinct=True),
                comments_total=Count("comments", distinct=True),
            )
            .order_by("-created_at")
        )

    def list(self, request, *args, **kwargs):
        try:
            offset = max(int(request.query_params.get("offset", 0)), 0)
        except (TypeError, ValueError):
            offset = 0

        try:
            limit = int(request.query_params.get("limit", 10))
        except (TypeError, ValueError):
            limit = 10
        limit = min(max(limit, 1), 30)

        queryset = self.get_queryset()
        total_count = queryset.count()
        paged_queryset = queryset[offset:offset + limit]
        serializer = self.get_serializer(paged_queryset, many=True, context={"request": request})

        returned_count = len(serializer.data)
        next_offset = offset + returned_count
        has_more = next_offset < total_count

        return Response(
            {
                "results": serializer.data,
                "next_offset": next_offset if has_more else None,
                "has_more": has_more,
            },
            status=status.HTTP_200_OK,
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SocialPostLikeToggleAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(SocialPost.objects.prefetch_related("likes"), pk=pk)
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            liked = False
        else:
            post.likes.add(request.user)
            liked = True

        return Response(
            {
                "liked": liked,
                "like_count": post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )


class SocialPostShareAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(SocialPost, pk=pk)
        post.shares_count = F("shares_count") + 1
        post.save(update_fields=["shares_count"])
        post.refresh_from_db(fields=["shares_count"])

        return Response(
            {
                "shares_count": post.shares_count,
            },
            status=status.HTTP_200_OK,
        )


class SocialPostCommentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = SocialPostCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]

    def get_queryset(self):
        post_id = self.kwargs["pk"]
        return (
            SocialPostComment.objects
            .filter(post_id=post_id)
            .select_related("user", "post")
            .prefetch_related("user__roles")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        post = get_object_or_404(SocialPost, pk=self.kwargs["pk"])
        serializer.save(post=post, user=self.request.user)
