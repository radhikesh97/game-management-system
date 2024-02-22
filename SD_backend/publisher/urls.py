# user/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from publisher import views



urlpatterns = [
    path('list', views.publisher_list),
    path('',views.publisher),
]
