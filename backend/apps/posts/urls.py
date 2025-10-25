from django.urls import path
from . import views

urlpatterns = [
    path('', views.PostListCreateView.as_view(), name='post-list-create'),
    path('<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('user/<str:username>/', views.UserPostsView.as_view(), name='user-posts'),
    path('<int:post_id>/like/', views.like_post, name='like-post'),
    path('<int:post_id>/comment/', views.comment_post, name='comment-post'),
    path('<int:post_id>/comments/', views.post_comments, name='post-comments'),
    path('<int:post_id>/share/', views.share_post, name='share-post'),
    path('shared/', views.shared_posts_list, name='shared-posts-list'),
]