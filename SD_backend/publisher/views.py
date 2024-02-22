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
from game.models import Game,Rate,Review
from forum.models import Forum,Forum_Like,Reply,Reply_Like
from publisher.models import Publisher,Publisher_Document,Publisher_FAQ,Game_Publisher
from collection.models import Collection,Component
from user.serializer import UserSerializer
from game.serializer import GameSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import response, permissions, status
from SD_backend.utils import is_visible

# Create your views here.
@api_view(['GET'])
@permission_classes([AllowAny])
def publisher_list(request):
    response = {}
    response_data=[]

    try:
        game_id=int(request.GET.get('game_id'))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    game = Game.objects.filter(id=game_id).first()

    publisher_list=Game_Publisher.objects.filter(game_id=game).values("publisher_id__id","publisher_id__name","publisher_id__description").all()
    size=len(publisher_list)
    
    try:
        for item in publisher_list:
            tmp={}
            tmp['id']=item['publisher_id__id']
            tmp['name']=item['publisher_id__name']
            tmp['description']=item['publisher_id__description']
            response_data.append(tmp)
        response['data']=response_data
        response['size']=size

    except Exception as e:
        print(e)
        response={}
        response['message'] = "Get publisher list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get publisher list success"
    return JsonResponse(response, safe=False)

@api_view(['GET'])
@permission_classes([AllowAny])
def publisher(request):
    response = {}

    try:
        publisher_id=int(request.GET.get('publisher_id'))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    publisher = Publisher.objects.filter(id=publisher_id).values("name","description").first()

    if publisher is None:
        response['message'] = "Publisher does not exist"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    try:
        response['data']=publisher
    except Exception as e:
        print(e)
        response={}
        response['message'] = "Get publisher fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get publisher success"
    return JsonResponse(response, safe=False)