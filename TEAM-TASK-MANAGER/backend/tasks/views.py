from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from users.permissions import IsAdminUser
from django.utils import timezone

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all()
        
        # Filtering by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        if user.role == 'member':
            return queryset.filter(assigned_to=user)
        return queryset

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False) or request.method == 'PATCH'
        instance = self.get_object()
        user = request.user
        
        # Determine which data to use
        if user.role == 'member':
            # Members can ONLY update status. We ignore other fields.
            if 'status' not in request.data:
                return Response(
                    {"detail": "Members must provide a 'status' field."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if they are trying to update other fields (for security reporting)
            restricted_fields = set(request.data.keys()) - {'status'}
            if restricted_fields:
                # We could just ignore them, but let's be explicit if they try to change them
                # However, if we want to be permissive, we can just take the status and ignore the rest
                update_data = {'status': request.data.get('status')}
            else:
                update_data = request.data
        else:
            update_data = request.data

        serializer = self.get_serializer(instance, data=update_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        task = self.get_object()
        user = request.user
        
        # Permission check
        if user.role == 'member' and task.assigned_to != user:
            return Response({"detail": "You can only update tasks assigned to you."}, status=status.HTTP_403_FORBIDDEN)
            
        new_status = request.data.get('status')
        if not new_status:
            return Response({"detail": "Status field is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        if new_status not in dict(Task.STATUS_CHOICES):
             return Response({"detail": f"Invalid status. Choices are: {list(dict(Task.STATUS_CHOICES).keys())}"}, status=status.HTTP_400_BAD_REQUEST)

        task.status = new_status
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard_stats(self, request):
        user = request.user
        tasks = self.get_queryset()
        
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='completed').count()
        pending_tasks = tasks.filter(status='pending').count()
        overdue_tasks = tasks.filter(due_date__lt=timezone.now()).exclude(status='completed').count()

        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'overdue_tasks': overdue_tasks,
        })
