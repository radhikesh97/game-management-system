import json
from django.shortcuts import render
from rest_framework import viewsets,status
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q,F,Count
from django.db import transaction, DatabaseError

from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from django.core.paginator import Paginator

from user.models import User,UserManager,Friend
from game.models import Game
from forum.models import Forum,Forum_Like,Reply,Reply_Like
from collection.models import Collection,Component
from user.serializer import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import response, permissions, status
from SD_backend.utils import is_visible

from SD_backend.authentication import JWTAuthentication

# Create your views here.
@api_view(['GET'])
@permission_classes([AllowAny])
def forum_list(request):
    try:
        user, payload=JWTAuthentication().authenticate(request=request)
        is_login=True
    except Exception as e:
        user=None
        is_login=False

    response = {}
    response_data=[]

    try:
        game_id=int(request.GET.get('game_id'))
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',5))
        is_DESC= request.GET.get('is_DESC',True) in ("True", "true", True)
        sort_by=str(request.GET.get('sort_by','time'))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    keyword = request.GET.get('keyword')
    
    game=Game.objects.filter(id=game_id).first()

    if game is None:
        response['message'] = 'Game does not exist'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    forum_list = Forum.objects.filter(game_id=game)

    if keyword is not None:
        forum_list=forum_list.filter(Q(title__icontains=keyword) | Q(text__icontains=keyword))
    
    if is_DESC:
        forum_list=forum_list.order_by('-'+sort_by)
    else:
        forum_list=forum_list.order_by(sort_by)

    forum_list = forum_list.annotate(reply_count=Count('forum_reply')).values('id','user_id','user_id__username','game_id','title','text','like','reply_count','visibility','time')

    try:
        for item in forum_list:
            if not is_visible(item['visibility'],item['user_id'],is_login,user):
                continue
            item['time']=item['time'].strftime("%d/%m/%Y")
            item['username']=item['user_id__username']
            del item['user_id__username']
            del item['visibility']
            if is_login:
                if Forum_Like.objects.filter(user_id=user.id,forum_id=item['id']).exists():
                    item['my_like']=True
                else:
                    item['my_like']=False
            response_data.append(item)
        paginator = Paginator(response_data, page_size)
        page_data=paginator.page(page)
        response['data']=page_data.object_list
        response['max_page']=paginator.num_pages
        response['has_next']=page_data.has_next()
        response['has_previous']=page_data.has_previous()
        response['start_index']=page_data.start_index()
        response['end_index']=page_data.end_index()

    except Exception as e:
        print(e)
        response={}
        response['message'] = "Get forum list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get forum list success"
    return JsonResponse(response, safe=False)


@api_view(['GET','POST','PATCH','DELETE'])
@permission_classes([AllowAny])
def forum(request):
    try:
        user, payload=JWTAuthentication().authenticate(request=request)
        is_login=True
    except Exception as e:
        user=None
        is_login=False
    response = {}

    if request.method == 'GET':
        try:
            forum_id=int(request.GET.get('forum_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        forum = Forum.objects.filter(id=forum_id).annotate(reply_count=Count('forum_reply')).values('id','user_id','user_id__username','game_id','title','text','like','reply_count','visibility','time').first()

        if forum is None:
            response['message'] = 'Forum does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if not is_visible(forum['visibility'],forum['user_id'],is_login,user):
            response['message'] = 'This forum is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        forum['time']=forum['time'].strftime("%d/%m/%Y")
        forum['username']=forum['user_id__username']
        del forum['user_id__username']
        del forum['visibility']
        if is_login:
            if Forum_Like.objects.filter(user_id=user.id,forum_id=forum['id']).exists():
                forum['my_like']=True
            else:
                forum['my_like']=False
        response['data']=forum
        response['message'] = "Get forum success"
        return JsonResponse(response, safe=False)
        
    elif request.method == 'POST':
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        data = json.loads(request.body)
        try:
            game_id=int(data.get('game_id'))
            title=str(data.get('title'))
            text=str(data.get('text'))
            visibility=int(data.get('visibility'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        game = Game.objects.filter(id=game_id).first()
        if game is None:
            response['message'] = 'Game does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if (title == "") or (text == ""):
            response['message'] = 'Title and text should not be blank'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        if (visibility > 3) or (visibility < 0):
            response['message'] = 'Wrong visibility code'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            forum = Forum(user_id=user,game_id=game,title=title,text=text,visibility=visibility)
            forum.save()
        except Exception as e:
            print(e)
            response['message'] = "Add forum fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Add forum success"
        return JsonResponse(response, safe=False)
    
    elif request.method == 'PATCH':
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            forum_id=int(request.GET.get('forum_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        data = json.loads(request.body)
        try:
            title=str(data.get('title'))
            text=str(data.get('text'))
            visibility=int(data.get('visibility'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if (title == "") or (text == ""):
            response['message'] = 'Title and text should not be blank'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        if (visibility > 3) or (visibility < 0):
            response['message'] = 'Wrong visibility code'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        forum = Forum.objects.filter(id=forum_id,user_id=user.id).first()
        if forum is None:
            response['message'] = 'Forum does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            forum.title=data.get('title')
            forum.text=data.get('text')
            forum.visibility=data.get('visibility')
            forum.save()
        except Exception as e:
            print(e)
            response['message'] = "Update forum fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Update forum success"
        return JsonResponse(response, safe=False)

    else:
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            forum_id=int(request.GET.get('forum_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        forum = Forum.objects.filter(id=forum_id,user_id=user.id).first()
        if forum is None:
            response['message'] = 'Forum does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            forum.delete()
        except Exception as e:
            print(e)
            response['message'] = "Remove forum fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Remove forum success"
        return JsonResponse(response, safe=False)
    
@api_view(['POST','DELETE'])
@transaction.atomic
def forum_like(request):
    user=request.user
    response = {}

    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            forum_id=int(data.get('forum_id'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        forum = Forum.objects.filter(id=forum_id).first()

        if forum is None:
            response['message'] = 'Forum does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if not is_visible(forum.visibility,forum.user_id_id,True,user):
            response['message'] = 'This forum is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        like = Forum_Like.objects.filter(user_id=user,forum_id=forum).first()

        if like is not None:
            response['message'] = 'You have liked this forum already'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            like=Forum_Like(user_id=user,forum_id=forum)
            forum.like=forum.like+1
            like.save()
            forum.save()
        except Exception as e:
            print(e)
            response['message'] = "Like forum fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        response['message'] = "Like forum success"
        return JsonResponse(response, safe=False)
    
    else:
        try:
            forum_id=int(request.GET.get('forum_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        like=Forum_Like.objects.filter(user_id=user,forum_id=forum_id).first()

        if like is None:
            response['message'] = 'You have not liked this forum yet'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        forum=like.forum_id

        if not is_visible(forum.visibility,forum.user_id_id,True,user):
            response['message'] = 'This forum is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        try:
            like.delete()
            forum.like=forum.like-1
            forum.save()
        except Exception as e:
            print(e)
            response['message'] = "Dislike forum fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        response['message'] = "Dislike forum success"
        return JsonResponse(response, safe=False)