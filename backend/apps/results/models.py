from django.db import models
from django.conf import settings
from apps.tests.models import Test

class TestResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_cheated = models.BooleanField(default=False)
    cheat_attempts = models.IntegerField(default=0)
    is_finished = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.test.title} - {self.score}"
