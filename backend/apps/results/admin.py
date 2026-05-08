from django.contrib import admin
from .models import TestResult

class TestResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'test', 'score', 'completed_at', 'is_cheated', 'is_finished']
    list_filter = ['is_cheated', 'is_finished', 'test']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']

admin.site.register(TestResult, TestResultAdmin)
