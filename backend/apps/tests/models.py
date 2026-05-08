from django.db import models

class Test(models.Model):
    title = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    time_limit = models.IntegerField(help_text="Time limit in minutes")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.department})"

class TestPool(models.Model):
    test = models.ForeignKey(Test, related_name='pools', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    pick_count = models.IntegerField(default=10)

    def __str__(self):
        return f"{self.name} (Pick {self.pick_count})"

class Question(models.Model):
    test = models.ForeignKey(Test, related_name='questions', on_delete=models.CASCADE)
    pool = models.ForeignKey(TestPool, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    text = models.TextField()
    image = models.ImageField(upload_to='questions/', blank=True, null=True)
    explanation = models.TextField(blank=True, null=True, help_text="Savol uchun izoh yoki tushuntirish")

    def __str__(self):
        return self.text[:50]

class Choice(models.Model):
    question = models.ForeignKey(Question, related_name='choices', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text
