from rest_framework import serializers
from .models import Project, ProjectMember
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectMemberSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMember
        fields = ('id', 'project', 'user', 'user_details')

    def get_user_details(self, obj):
        return {
            'username': obj.user.username,
            'email': obj.user.email,
            'role': obj.user.role
        }

class ProjectSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    members = ProjectMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'created_by', 'created_by_name', 'members', 'created_at')
        read_only_fields = ('created_by',)
