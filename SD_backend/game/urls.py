# game/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from game import views

urlpatterns_review = [
    path('list', views.review_list),
    path('my', views.my_review),
    path('', views.review),
]


urlpatterns = [
    path('list', views.game_list),
    path('rate',views.rate),
    path('review/',include(urlpatterns_review)),
    path('', views.game),
]
