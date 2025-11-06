from django.urls import path
from . import views

urlpatterns = [
    # Rutas específicas primero para evitar que la ruta genérica '<str:username>/'
    # capture segmentos literales como 'follow' o 'unfollow'.
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/delete/', views.delete_account, name='delete-account'),
    path('change-password/', views.change_password, name='change-password'),
    path('suggested/', views.SuggestedUsersView.as_view(), name='suggested-users'),
    path('follow/<str:username>/', views.follow_user, name='follow-user'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow-user'),
    path('', views.UserListView.as_view(), name='user-list'),
    path('<int:pk>/', views.UserDetailByIdView.as_view(), name='user-detail-by-id'),
    path('<str:username>/followers/', views.user_followers, name='user-followers'),
    path('<str:username>/following/', views.user_following, name='user-following'),
    path('<str:username>/', views.UserDetailView.as_view(), name='user-detail'),
]