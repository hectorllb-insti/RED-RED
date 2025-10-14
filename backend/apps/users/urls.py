from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('', views.UserListView.as_view(), name='user-list'),
    path('<int:pk>/', views.UserDetailByIdView.as_view(), name='user-detail-by-id'),
    path('<str:username>/', views.UserDetailView.as_view(), name='user-detail'),
    path('follow/<str:username>/', views.follow_user, name='follow-user'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow-user'),
    path('<str:username>/followers/', views.user_followers, name='user-followers'),
    path('<str:username>/following/', views.user_following, name='user-following'),
]