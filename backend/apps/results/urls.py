from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResultViewSet, TestSubmitView, TestStartView, DashboardStatsView, ResetResultView

router = DefaultRouter()
router.register('', ResultViewSet)

urlpatterns = [
    path('start/', TestStartView.as_view(), name='test-start'),
    path('submit/', TestSubmitView.as_view(), name='test-submit'),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('<int:pk>/reset/', ResetResultView.as_view(), name='reset-result'),
    path('', include(router.urls)),
]
