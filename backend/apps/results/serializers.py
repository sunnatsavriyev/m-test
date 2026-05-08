from rest_framework import serializers
from .models import TestResult, UserAnswer
from apps.users.serializers import UserSerializer
from apps.tests.serializers import TestSerializer, QuestionSerializer

class UserAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source='question.text')
    explanation = serializers.ReadOnlyField(source='question.explanation')
    selected_choice_text = serializers.ReadOnlyField(source='selected_choice.text')
    correct_choice_text = serializers.SerializerMethodField()
    correct_choice = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAnswer
        fields = ('id', 'question', 'question_text', 'selected_choice', 'selected_choice_text', 'is_correct', 'correct_choice', 'correct_choice_text', 'explanation')

    def get_correct_choice(self, obj):
        correct = obj.question.choices.filter(is_correct=True).first()
        return correct.id if correct else None
        
    def get_correct_choice_text(self, obj):
        correct = obj.question.choices.filter(is_correct=True).first()
        return correct.text if correct else None

class TestResultSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    test_detail = TestSerializer(source='test', read_only=True)
    answers = UserAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = TestResult
        fields = (
            'id', 'user', 'user_detail', 'test', 'test_detail', 
            'score', 'correct_answers', 'total_questions',
            'started_at', 'completed_at', 'is_cheated', 
            'cheat_attempts', 'cheat_details', 'is_finished', 'answers'
        )

class TestSubmitSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    result_id = serializers.IntegerField(required=False) # ID of the active TestResult session
    session_token = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    answers = serializers.JSONField() # {question_id: choice_id}
    question_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    is_cheated = serializers.BooleanField(default=False)
    cheat_attempts = serializers.IntegerField(default=0)
    cheat_details = serializers.CharField(required=False, allow_blank=True)

class TestStartSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    session_token = serializers.CharField(required=False, allow_blank=True, allow_null=True)
