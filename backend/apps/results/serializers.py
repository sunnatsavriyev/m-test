from rest_framework import serializers
from .models import TestResult
from apps.users.serializers import UserSerializer
from apps.tests.serializers import TestSerializer

class TestResultSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    test_detail = TestSerializer(source='test', read_only=True)
    
    class Meta:
        model = TestResult
        fields = '__all__'

class TestSubmitSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    answers = serializers.JSONField() # {question_id: choice_id}
    is_cheated = serializers.BooleanField(default=False)
    cheat_attempts = serializers.IntegerField(default=0)
