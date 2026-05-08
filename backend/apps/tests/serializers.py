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
    choices = ChoicePublicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ('id', 'text', 'image', 'choices')

class TestSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    
    class Meta:
        model = Test
        fields = ('id', 'title', 'department', 'time_limit', 'is_active', 'created_at', 'question_count')

class TestUploadSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    department = serializers.CharField(max_length=255)
    time_limit = serializers.IntegerField()
    file = serializers.FileField()
