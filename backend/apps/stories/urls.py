from django.urls import path
from . import views

urlpatterns = [
    path('', views.StoryListCreateView.as_view(), name='story-list-create'),
    path('user/<str:username>/', views.UserStoriesView.as_view(), name='user-stories'),
    path('<int:story_id>/view/', views.view_story, name='view-story'),
    path('<int:story_id>/viewers/', views.story_viewers, name='story-viewers'),
]