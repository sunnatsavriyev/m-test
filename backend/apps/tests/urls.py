from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestViewSet, TestUploadView, TestQuestionsView

router = DefaultRouter()
router.register('', TestViewSet)

urlpatterns = [
    path('upload/', TestUploadView.as_view(), name='test-upload'),
    path('<int:test_id>/questions/', TestQuestionsView.as_view(), name='test-questions'),
    path('', include(router.urls)),
]
