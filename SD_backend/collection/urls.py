# collection/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from collection import views

urlpatterns_component=[
    path('list',views.component_list),
    path('', views.component),
]

urlpatterns = [
    path('list', views.collection_list),
    path('', views.collection),
    path('component/',include(urlpatterns_component))
]
