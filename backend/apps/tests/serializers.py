from rest_framework import serializers
from .models import Test, Question, Choice

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'text', 'is_correct')

class ChoicePublicSerializer(serializers.ModelSerializer):
    """Hide is_correct for public view"""
    class Meta:
        model = Choice
        fields = ('id', 'text')

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ('id', 'text', 'image', 'choices')

class QuestionPublicSerializer(serializers.ModelSerializer):
    choices = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ('id', 'text', 'image', 'choices')

    def get_choices(self, obj):
        choices = list(obj.choices.all())
        import random
        random.shuffle(choices)
        return ChoicePublicSerializer(choices, many=True).data

class TestSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    user_results = serializers.SerializerMethodField()
    
    class Meta:
        model = Test
        fields = ('id', 'title', 'department', 'time_limit', 'is_active', 'created_at', 'question_count', 'user_results')

    def get_user_results(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.results.models import TestResult
            from apps.results.serializers import TestResultSerializer
            results = TestResult.objects.filter(user=request.user, test=obj, is_finished=True).order_by('-completed_at')
            # Only return basic info to keep it light
            return [{'id': r.id, 'score': r.score, 'date': r.completed_at, 'correct': r.correct_answers, 'total': r.total_questions} for r in results]
        return []

class TestUploadSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    department = serializers.CharField(max_length=255)
    time_limit = serializers.IntegerField()
    file = serializers.FileField()
