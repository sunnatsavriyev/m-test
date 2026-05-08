from django.db import models
from django.conf import settings
from apps.tests.models import Test, Question, Choice

class TestResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    correct_answers = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_cheated = models.BooleanField(default=False)
    cheat_attempts = models.IntegerField(default=0)
    cheat_details = models.TextField(blank=True, null=True)
    is_finished = models.BooleanField(default=False)
    session_token = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.test.title} - {self.score}%"

class UserAnswer(models.Model):
    result = models.ForeignKey(TestResult, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.result.user.username} - Q:{self.question_id} - Correct:{self.is_correct}"
