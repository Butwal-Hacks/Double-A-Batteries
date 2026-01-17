from django.urls import path
from .views import (
    ExplainCodeView, HealthCheckView, SignupView, LoginView,
    HistoryListView, HistorySaveView, HistoryDetailView,
    ExamplesListView, ExampleDetailView,
    ShareCreateView, ShareDetailView,
    FollowUpView, CodeComparisonView
)

urlpatterns = [
    # Core endpoints
    path('explain/', ExplainCodeView.as_view(), name='explain-code'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    
    # History endpoints
    path('history/list/', HistoryListView.as_view(), name='history-list'),
    path('history/save/', HistorySaveView.as_view(), name='history-save'),
    path('history/<int:pk>/', HistoryDetailView.as_view(), name='history-detail'),
    
    # Examples endpoints
    path('examples/', ExamplesListView.as_view(), name='examples-list'),
    path('examples/<str:language>/', ExampleDetailView.as_view(), name='examples-detail'),
    
    # Sharing endpoints
    path('share/create/', ShareCreateView.as_view(), name='share-create'),
    path('share/<str:share_id>/', ShareDetailView.as_view(), name='share-detail'),
    
    # Chat/Q&A endpoints
    path('chat/followup/', FollowUpView.as_view(), name='followup'),
    
    # Comparison endpoint
    path('analyze/compare/', CodeComparisonView.as_view(), name='compare-code'),
]

