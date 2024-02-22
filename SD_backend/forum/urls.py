# game/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from forum import views_forum,views_reply


urlpatterns_reply=[
    path('list',views_reply.reply_list),
    path('like', views_reply.reply_like),
    path('', views_reply.reply),
]

urlpatterns = [
    path('list', views_forum.forum_list),
    path('like', views_forum.forum_like),
    path('reply/', include(urlpatterns_reply)),
    path('', views_forum.forum),

]
