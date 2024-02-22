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
def reply_list(request):
    try:
        user, payload=JWTAuthentication().authenticate(request=request)
        is_login=True
    except Exception as e:
        user=None
        is_login=False

    response = {}
    response_data=[]

    try:
        forum_id=int(request.GET.get('forum_id'))
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',5))
        is_DESC= request.GET.get('is_DESC',True) in ("True", "true", True)
        sort_by=str(request.GET.get('sort_by','time'))
    except Exception as e:
        print(e)
        response={}
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    forum=Forum.objects.filter(id=forum_id).first()

    if forum is None:
        response['message'] = 'Forum does not exist'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    if not is_visible(forum.visibility,forum.user_id_id,is_login,user):
        response['message'] = 'This forum is invisible to you'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    reply_list = Reply.objects.filter(forum_id=forum)
    
    if is_DESC:
        reply_list=reply_list.order_by('-'+sort_by)
    else:
        reply_list=reply_list.order_by(sort_by)

    reply_list = reply_list.values('id','user_id','user_id__username','forum_id','text','like','visibility','time')

    try:
        for item in reply_list:
            if not is_visible(item['visibility'],item['user_id'],is_login,user):
                continue
            item['time']=item['time'].strftime("%d/%m/%Y")
            item['username']=item['user_id__username']
            del item['user_id__username']
            del item['visibility']
            if is_login:
                if Reply_Like.objects.filter(user_id=user.id,reply_id=item['id']).exists():
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
        response['message'] = "Get reply list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get reply list success"
    return JsonResponse(response, safe=False)


@api_view(['GET','POST','PATCH','DELETE'])
@permission_classes([AllowAny])
def reply(request):
    try:
        user, payload=JWTAuthentication().authenticate(request=request)
        is_login=True
    except Exception as e:
        user=None
        is_login=False
    response = {}

    if request.method == 'GET':
        try:
            reply_id=int(request.GET.get('reply_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        reply = Reply.objects.filter(id=reply_id).values('id','user_id','user_id__username','forum_id','text','like','visibility','time').first()

        if reply is None:
            response['message'] = 'Reply does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if not is_visible(reply['visibility'],reply['user_id'],is_login,user):
            response['message'] = 'This reply is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        reply['time']=reply['time'].strftime("%d/%m/%Y")
        reply['username']=reply['user_id__username']
        del reply['user_id__username']
        del reply['visibility']
        if is_login:
            if Reply_Like.objects.filter(user_id=user.id,reply_id=reply['id']).exists():
                reply['my_like']=True
            else:
                reply['my_like']=False
        response['data']=reply
        response['message'] = "Get reply success"
        return JsonResponse(response, safe=False)
        
    elif request.method == 'POST':
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        data = json.loads(request.body)
        try:
            forum_id=int(data.get('forum_id'))
            text=str(data.get('text'))
            visibility=int(data.get('visibility'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        forum = Forum.objects.filter(id=forum_id).first()
        if forum is None:
            response['message'] = 'Forum does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if not is_visible(forum.visibility,forum.user_id_id,is_login,user):
            response['message'] = 'This forum is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if (text == ""):
            response['message'] = 'Text should not be blank'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        if (visibility > 3) or (visibility < 0):
            response['message'] = 'Wrong visibility code'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reply = Reply(user_id=user,forum_id=forum,text=text,visibility=visibility)
            reply.save()
        except Exception as e:
            print(e)
            response['message'] = "Add reply fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Add reply success"
        return JsonResponse(response, safe=False)
    
    elif request.method == 'PATCH':
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reply_id=int(request.GET.get('reply_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        data = json.loads(request.body)
        try:
            text=str(data.get('text'))
            visibility=int(data.get('visibility'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if (text == ""):
            response['message'] = 'Text should not be blank'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        if (visibility > 3) or (visibility < 0):
            response['message'] = 'Wrong visibility code'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        reply = Reply.objects.filter(id=reply_id,user_id=user.id).first()
        if reply is None:
            response['message'] = 'Reply does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reply.text=data.get('text')
            reply.visibility=data.get('visibility')
            reply.save()
        except Exception as e:
            print(e)
            response['message'] = "Update reply fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Update reply success"
        return JsonResponse(response, safe=False)

    else:
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reply_id=int(request.GET.get('reply_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        reply = Reply.objects.filter(id=reply_id,user_id=user.id).first()
        if reply is None:
            response['message'] = 'Reply does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reply.delete()
        except Exception as e:
            print(e)
            response['message'] = "Remove reply fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Remove reply success"
        return JsonResponse(response, safe=False)
    
@api_view(['POST','DELETE'])
@transaction.atomic
def reply_like(request):
    user=request.user
    response = {}

    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            reply_id=int(data.get('reply_id'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        reply = Reply.objects.filter(id=reply_id).first()

        if reply is None:
            response['message'] = 'Reply does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if not is_visible(reply.visibility,reply.user_id_id,True,user):
            response['message'] = 'This reply is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        like = Reply_Like.objects.filter(user_id=user,reply_id=reply).first()

        if like is not None:
            response['message'] = 'You have liked this reply already'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            like=Reply_Like(user_id=user,reply_id=reply)
            reply.like=reply.like+1
            like.save()
            reply.save()
        except Exception as e:
            print(e)
            response['message'] = "Like reply fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        response['message'] = "Like reply success"
        return JsonResponse(response, safe=False)
    
    else:
        try:
            reply_id=int(request.GET.get('reply_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        like=Reply_Like.objects.filter(user_id=user,reply_id=reply_id).first()

        if like is None:
            response['message'] = 'You have not liked this reply yet'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        reply=like.reply_id

        if not is_visible(reply.visibility,reply.user_id_id,True,user):
            response['message'] = 'This reply is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        try:
            like.delete()
            reply.like=reply.like-1
            reply.save()
        except Exception as e:
            print(e)
            response['message'] = "Dislike reply fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        response['message'] = "Dislike reply success"
        return JsonResponse(response, safe=False)