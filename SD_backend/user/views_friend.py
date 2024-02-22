import json
from django.shortcuts import render
from rest_framework import viewsets,status
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q,F
from django.db import transaction, DatabaseError

from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes

from user.models import User,UserManager,Friend
from user.serializer import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import response, permissions, status

from SD_backend.authentication import JWTAuthentication

# Create your views here.

@api_view(['GET'])
def list(request):
    user_self = request.user
    response = {}
    response_data=[]

    queryset = Friend.objects.filter(from_user = user_self).values("to_user__id","to_user__username","to_user__city","to_user__country", "time")
    for item in queryset:
        tmp={}
        tmp['id']=item['to_user__id']
        tmp['username']=item['to_user__username']
        tmp['city']=item['to_user__city']
        tmp['country']=item['to_user__country']
        tmp['time']=item['time'].strftime("%d/%m/%Y")
        response_data.append(tmp)
    response['data']=response_data
    response['size']=queryset.count()
    response['message'] = "Get friend list success"
    
    return JsonResponse(response, safe=False)
    

@api_view(['POST','DELETE'])
def friend(request):
    if request.method == 'POST':
        user_self = request.user
        data = json.loads(request.body)
        response = {}

        try:
            user_id = int(data.get("user_id"))
        except:
            response['message'] = 'Friend info missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        if Friend.objects.filter(from_user=user_self,to_user_id=user_id).count() != 0:
            response['message'] = 'You are friends already'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = Friend(from_user=user_self,to_user_id=user_id)
            friend.save()
        except Exception as e:
            print(e)
            response['message'] = "Add friend fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        response['message'] = "Add friend success"
        return JsonResponse(response, safe=False)
    else:
        user_self = request.user
        data = json.loads(request.body)
        response = {}

        try:
            user_id = int(data.get("user_id"))
        except:
            response['message'] = 'Friend info missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        friend_relations = Friend.objects.filter(from_user=user_self,to_user_id=user_id)

        if friend_relations.count() == 0:
            response['message'] = 'You are not friends yet'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend_relations.delete()
        except Exception as e:
            print(e)
            response['message'] = "Remove friend fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        response['message'] = "Remove friend success"
        return JsonResponse(response, safe=False)


#@api_view(['DELETE'])
#def remove(request):
#    user_self = request.user
#    data = json.loads(request.body)
#    response = {}
#
#    user_id = data.get("user_id")
#
#    if (not user_id):
#        response['message'] = 'Friend info missing'
#        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
#    
#    friend_relations = Friend.objects.filter(from_user=user_self,to_user_id=user_id)
#    
#    if friend_relations.count() == 0:
#        response['message'] = 'You are not friends yet'
#        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
#    
#    try:
#        friend_relations.delete()
#    except Exception as e:
#        print(e)
#        response['message'] = "Remove friend fail"
#        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
#
#    response['message'] = "Remove friend success"
#    return JsonResponse(response, safe=False)