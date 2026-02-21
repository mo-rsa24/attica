from rest_framework import serializers
from .models import CustomUser, Role, UserProfile, SocialPost, SocialPostComment


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="name",
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "roles",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer used for user registration from the React app."""

    password = serializers.CharField(write_only=True)
    roles = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "password",
            "user_type",
            "profile_picture",
            "roles",
        ]

    def create(self, validated_data):
        roles = validated_data.pop("roles", [])
        password = validated_data.pop("password")
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        role_objs = []
        for name in roles:
            role, _ = Role.objects.get_or_create(name=name)
            role_objs.append(role)
        if role_objs:
            user.roles.set(role_objs)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model.
    It includes nested user data for a complete profile view.
    """
    # This nests the UserSerializer within the UserProfileSerializer.
    # When we fetch a UserProfile, it will automatically include the related user's data.
    # The 'source' attribute points to the related model field.
    user = UserSerializer(required=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'bio', 'profile_picture']
        # You can make the profile picture read-only in the main serializer
        # if you want to handle uploads via a separate mechanism, but for simplicity,
        # we will handle it in the update method of the view.
        read_only_fields = ['profile_picture']

    def update(self, instance, validated_data):
        """
        Custom update method to handle nested user data.
        """
        # Pop the nested 'user' data out of the validated_data dictionary.
        user_data = validated_data.pop('user', {})
        # Get the user object associated with the profile instance.
        user = instance.user

        # Update UserProfile fields (e.g., bio)
        # This uses the default update logic for the main instance (UserProfile).
        instance = super().update(instance, validated_data)

        # Update User fields (e.g., username, email)
        user_serializer = UserSerializer(instance=user, data=user_data, partial=True)
        if user_serializer.is_valid(raise_exception=True):
            user_serializer.save()

        return instance


class SocialPostUserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="name",
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "profile_picture",
            "roles",
        ]


class SocialPostCommentSerializer(serializers.ModelSerializer):
    user = SocialPostUserSerializer(read_only=True)

    class Meta:
        model = SocialPostComment
        fields = [
            "id",
            "post",
            "user",
            "content",
            "created_at",
        ]
        read_only_fields = ["id", "post", "user", "created_at"]


class SocialPostSerializer(serializers.ModelSerializer):
    user = SocialPostUserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = SocialPost
        fields = [
            "id",
            "user",
            "text",
            "image",
            "created_at",
            "updated_at",
            "like_count",
            "comment_count",
            "shares_count",
            "is_liked",
        ]
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
            "like_count",
            "comment_count",
            "shares_count",
            "is_liked",
        ]

    def get_like_count(self, obj):
        return getattr(obj, "likes_total", obj.likes.count())

    def get_comment_count(self, obj):
        return getattr(obj, "comments_total", obj.comments.count())

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        prefetched_likes = getattr(obj, "_prefetched_objects_cache", {}).get("likes")
        if prefetched_likes is not None:
            return any(like.id == request.user.id for like in prefetched_likes)

        return obj.likes.filter(id=request.user.id).exists()
