from django.contrib import admin
from .models import Test, Question, Choice

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4

class QuestionAdmin(admin.ModelAdmin):
    inlines = [ChoiceInline]
    list_display = ['text', 'test']
    list_filter = ['test']

class TestAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'time_limit', 'is_active', 'created_at']
    list_filter = ['department', 'is_active']

admin.site.register(Test, TestAdmin)
admin.site.register(Question, QuestionAdmin)
