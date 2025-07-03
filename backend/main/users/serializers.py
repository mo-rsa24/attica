from rest_framework import serializers
from .models import CustomUser, Role


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
            "user_type",
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