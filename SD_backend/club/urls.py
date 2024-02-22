# club/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from club import views


urlpatterns = [
    path('list', views.club_list),
]
