from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from .models import Test, Question, Choice
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
        return Test.objects.filter(department=user.department, is_active=True)

class TestUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        if request.user.role != 'super_admin':
            return Response({'error': 'Only Super Admin can upload tests'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = TestUploadSerializer(data=request.data)
        if serializer.is_valid():
            test_file = request.FILES['file']
            # Save file temporarily
            temp_path = os.path.join(settings.MEDIA_ROOT, 'temp_excel', test_file.name)
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            
            with open(temp_path, 'wb+') as destination:
                for chunk in test_file.chunks():
                    destination.write(chunk)
            
            # Create Test object
            test = Test.objects.create(
                title=serializer.validated_data['title'],
                department=serializer.validated_data['department'],
                time_limit=serializer.validated_data['time_limit']
            )
            
            try:
                count = parse_test_excel(test, temp_path)
                os.remove(temp_path)
                return Response({'message': f'Test created with {count} questions'}, status=status.HTTP_201_CREATED)
            except Exception as e:
                test.delete()
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestQuestionsView(generics.ListAPIView):
    serializer_class = QuestionPublicSerializer
    
    def get_queryset(self):
        test_id = self.kwargs.get('test_id')
        # Return questions in random order
        return Question.objects.filter(test_id=test_id).order_by('?')
