# user/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from user import views_user,views_friend


urlpatterns_friend = [
    path('list',views_friend.list),
    path('',views_friend.friend),
]


urlpatterns = [
    path('list', views_user.user_list),
    path('register',views_user.register),
    path('login',views_user.login),
    path('profile',views_user.profile),
    path('search',views_user.search_user),
    path('ban',views_user.ban),
    path('password/change',views_user.change_password),
    path('password/forget',views_user.forget_password),
    path('friend/',include(urlpatterns_friend)),
]
