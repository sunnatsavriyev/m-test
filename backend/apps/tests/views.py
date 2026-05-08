from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from .models import Test, Question, Choice, TestPool
from .serializers import TestSerializer, TestUploadSerializer, QuestionPublicSerializer
from .utils import parse_test_excel
import os
from django.conf import settings

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin' or user.role == 'monitoring':
            return Test.objects.all()
        
        # Dept Head and Employee can only see tests for their department
        if user.department:
            return Test.objects.filter(
                Q(department=str(user.department.id)) | Q(department=user.department.name),
                is_active=True
            )
        return Test.objects.none()

class TestUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        if request.user.role != 'super_admin' and request.user.role != 'dept_head':
            return Response({'error': 'Only Admin can upload tests'}, status=status.HTTP_403_FORBIDDEN)
            
        # Get basic data
        title = request.data.get('title')
        department = request.data.get('department')
        time_limit = request.data.get('time_limit', 30)
        
        # Get pools data
        # We expect fields like 'pools[0][file]', 'pools[0][pick_count]', etc.
        # But it's easier to just parse them from the request.FILES and request.data
        
        test = Test.objects.create(
            title=title,
            department=department,
            time_limit=time_limit
        )
        
        try:
            pool_idx = 0
            total_questions = 0
            while True:
                file_key = f'pools[{pool_idx}][file]'
                pick_count_key = f'pools[{pool_idx}][pick_count]'
                name_key = f'pools[{pool_idx}][name]'
                
                if file_key not in request.FILES:
                    break
                
                test_file = request.FILES[file_key]
                pick_count = int(request.data.get(pick_count_key, 10))
                pool_name = request.data.get(name_key, f"Pool {pool_idx + 1}")
                
                # Save file temporarily
                temp_path = os.path.join(settings.MEDIA_ROOT, 'temp_excel', test_file.name)
                os.makedirs(os.path.dirname(temp_path), exist_ok=True)
                
                with open(temp_path, 'wb+') as destination:
                    for chunk in test_file.chunks():
                        destination.write(chunk)
                
                # Create Pool
                pool = TestPool.objects.create(
                    test=test,
                    name=pool_name,
                    pick_count=pick_count
                )
                
                # Parse
                count = parse_test_excel(test, temp_path, pool=pool)
                total_questions += count
                os.remove(temp_path)
                pool_idx += 1
            
            if total_questions == 0:
                # Handle single file upload for backward compatibility or if only one file was sent normally
                if 'file' in request.FILES:
                    test_file = request.FILES['file']
                    temp_path = os.path.join(settings.MEDIA_ROOT, 'temp_excel', test_file.name)
                    os.makedirs(os.path.dirname(temp_path), exist_ok=True)
                    with open(temp_path, 'wb+') as destination:
                        for chunk in test_file.chunks():
                            destination.write(chunk)
                    count = parse_test_excel(test, temp_path)
                    os.remove(temp_path)
                    total_questions = count

            return Response({'message': f'Test created with {total_questions} questions across {pool_idx} pools'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            test.delete()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TestQuestionsView(generics.ListAPIView):
    serializer_class = QuestionPublicSerializer
    
    def get_queryset(self):
        test_id = self.kwargs.get('test_id')
        test = Test.objects.get(id=test_id)
        pools = test.pools.all()
        
        if not pools.exists():
            # Old logic for tests without pools
            return Question.objects.filter(test_id=test_id).order_by('?')
            
        selected_questions = []
        for pool in pools:
            pool_questions = list(Question.objects.filter(pool=pool).order_by('?')[:pool.pick_count])
            selected_questions.extend(pool_questions)
            
        import random
        random.shuffle(selected_questions)
        return selected_questions

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
