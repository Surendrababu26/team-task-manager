from rest_framework import serializers
from .models import Task
from projects.serializers import ProjectSerializer

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'due_date', 
            'assigned_to', 'assigned_to_name', 'project', 'project_name', 'created_at'
        )

    def validate_due_date(self, value):
        from django.utils import timezone
        # Only validate if creating a new task or if the due date is being changed
        if not self.instance or self.instance.due_date != value:
            if value < timezone.now():
                raise serializers.ValidationError("Due date cannot be in the past.")
        return value
