from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count, Max
from .models import TestResult
from apps.tests.models import Test, Question, Choice
from apps.users.models import User, Department
from .serializers import TestResultSerializer, TestSubmitSerializer
from django.utils import timezone

class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TestResult.objects.all()
    serializer_class = TestResultSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin' or user.role == 'monitoring':
            return TestResult.objects.all().order_by('-completed_at')
        elif user.role == 'dept_head':
            return TestResult.objects.filter(user__department=user.department).order_by('-completed_at')
        return TestResult.objects.filter(user=user).order_by('-completed_at')

class TestSubmitView(APIView):
    def post(self, request):
        serializer = TestSubmitSerializer(data=request.data)
        if serializer.is_valid():
            test_id = serializer.validated_data['test_id']
            answers = serializer.validated_data['answers']
            is_cheated = serializer.validated_data['is_cheated']
            cheat_attempts = serializer.validated_data['cheat_attempts']
            
            try:
                test = Test.objects.get(id=test_id)
            except Test.DoesNotExist:
                return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if already submitted and not reset
            if TestResult.objects.filter(user=request.user, test=test, is_finished=True).exists():
                return Response({'error': 'You have already completed this test'}, status=status.HTTP_400_BAD_REQUEST)
            
            correct_count = 0
            total_questions = test.questions.count()
            
            for q_id, c_id in answers.items():
                try:
                    choice = Choice.objects.get(id=c_id, question_id=q_id)
                    if choice.is_correct:
                        correct_count += 1
                except Choice.DoesNotExist:
                    continue
            
            score = (correct_count / total_questions * 100) if total_questions > 0 else 0
            
            result = TestResult.objects.create(
                user=request.user,
                test=test,
                score=score,
                completed_at=timezone.now(),
                is_cheated=is_cheated,
                cheat_attempts=cheat_attempts,
                is_finished=True
            )
            
            return Response(TestResultSerializer(result).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardStatsView(APIView):
    def get(self, request):
        # 10 eng ko'p test ishlagan xizmatlar (by count of results)
        top_departments = TestResult.objects.values('user__department')\
            .annotate(test_count=Count('id'), avg_score=Avg('score'))\
            .order_by('-test_count')[:10]
            
        # Umumiy reyting (Top 10 users by average score)
        global_ranking = TestResult.objects.values('user__username', 'user__first_name', 'user__last_name', 'user__department')\
            .annotate(avg_score=Avg('score'), tests_done=Count('id'))\
            .order_by('-avg_score', '-tests_done')[:10]
            
        return Response({
            'top_departments': top_departments,
            'global_ranking': global_ranking,
            'total_users': User.objects.count(),
            'total_tests_taken': TestResult.objects.count(),
            'total_departments': Department.objects.count()
        })

class ResetResultView(APIView):
    def post(self, request, pk):
        if request.user.role != 'super_admin':
            return Response({'error': 'Only Super Admin can reset results'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            result = TestResult.objects.get(pk=pk)
            result.delete()
            return Response({'message': 'Result reset successfully'}, status=status.HTTP_200_OK)
        except TestResult.DoesNotExist:
            return Response({'error': 'Result not found'}, status=status.HTTP_404_NOT_FOUND)
