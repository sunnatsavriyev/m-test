from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count, Max
from .models import TestResult, UserAnswer
from apps.tests.models import Test, Question, Choice
from apps.users.models import User, Department
from .serializers import TestResultSerializer, TestSubmitSerializer, TestStartSerializer
from django.utils import timezone
import uuid

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

class TestStartView(APIView):
    def post(self, request):
        serializer = TestStartSerializer(data=request.data)
        if serializer.is_valid():
            test_id = serializer.validated_data['test_id']
            incoming_token = serializer.validated_data.get('session_token')
            
            try:
                test = Test.objects.get(id=test_id)
            except Test.DoesNotExist:
                return Response({'error': 'Test topilmadi'}, status=status.HTTP_404_NOT_FOUND)
            
            # Faqat aynan shu test uchun tugallanmagan sessionni tekshirish
            active_result = TestResult.objects.filter(user=request.user, test_id=test_id, is_finished=False).first()
            
            if active_result:
                # Session_token'ni tekshirish
                if active_result.session_token and incoming_token != active_result.session_token:
                    return Response({
                        'error': 'Ushbu test boshqa qurilma yoki brauzerda boshlangan. Bir vaqtning o\'zida faqat bitta joydan ishlash mumkin.',
                        'is_another_device': True
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Davom ettirishga ruxsat
                return Response({
                    'message': 'Test davom ettirilmoqda',
                    'result_id': active_result.id,
                    'session_token': active_result.session_token,
                    'is_continued': True
                })
            
            # Yangi session yaratish
            new_token = str(uuid.uuid4())
            result = TestResult.objects.create(
                user=request.user,
                test=test,
                session_token=new_token,
                is_finished=False
            )
            
            return Response({
                'message': 'Test boshlandi',
                'result_id': result.id,
                'session_token': new_token,
                'is_continued': False
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestSubmitView(APIView):
    def post(self, request):
        serializer = TestSubmitSerializer(data=request.data)
        if serializer.is_valid():
            test_id = serializer.validated_data['test_id']
            result_id = serializer.validated_data.get('result_id')
            session_token = serializer.validated_data.get('session_token')
            answers_data = serializer.validated_data['answers']
            question_ids = serializer.validated_data.get('question_ids', [])
            is_cheated = serializer.validated_data['is_cheated']
            cheat_attempts = serializer.validated_data['cheat_attempts']
            cheat_details = serializer.validated_data.get('cheat_details', '')
            
            try:
                test = Test.objects.get(id=test_id)
            except Test.DoesNotExist:
                return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Sessionni tekshirish
            if result_id:
                try:
                    result = TestResult.objects.get(id=result_id, user=request.user)
                    if result.session_token and result.session_token != session_token:
                         return Response({'error': 'Session mismatch'}, status=status.HTTP_403_FORBIDDEN)
                except TestResult.DoesNotExist:
                    return Response({'error': 'Active session not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Agar result_id kelmasa, yangi yaratish (fallback)
                result = TestResult.objects.create(
                    user=request.user,
                    test=test,
                    is_finished=False
                )
            
            final_q_ids = question_ids if question_ids else list(answers_data.keys())
            total_questions = len(final_q_ids)
            
            if total_questions == 0:
                total_questions = test.questions.count()
                final_q_ids = list(test.questions.values_list('id', flat=True))
            
            # Update the result
            result.completed_at = timezone.now()
            result.is_cheated = is_cheated
            result.cheat_attempts = cheat_attempts
            result.cheat_details = cheat_details
            result.is_finished = True
            result.total_questions = total_questions
            
            # Eski javoblarni o'chirish (agar bo'lsa - davom ettirilgan bo'lsa)
            UserAnswer.objects.filter(result=result).delete()
            
            correct_count = 0
            for q_id in final_q_ids:
                try:
                    question = Question.objects.get(id=q_id)
                    c_id = answers_data.get(str(q_id)) or answers_data.get(int(q_id))
                    
                    choice = None
                    is_correct = False
                    if c_id:
                        choice = Choice.objects.get(id=c_id, question=question)
                        is_correct = choice.is_correct
                    
                    if is_correct:
                        correct_count += 1
                        
                    UserAnswer.objects.create(
                        result=result,
                        question=question,
                        selected_choice=choice,
                        is_correct=is_correct
                    )
                except (Question.DoesNotExist, Choice.DoesNotExist):
                    continue
            
            score = (correct_count / total_questions * 100) if total_questions > 0 else 0
            result.score = round(score, 2)
            result.correct_answers = correct_count
            result.save()
            
            return Response(TestResultSerializer(result).data, status=status.HTTP_200_OK)
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
