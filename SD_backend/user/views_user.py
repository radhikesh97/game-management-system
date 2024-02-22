from datetime import datetime
import json
from django.shortcuts import render
from rest_framework import viewsets,status
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q,Count
from django.utils import timezone

from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from django.core.paginator import Paginator

from user.models import User,UserManager,Friend
from user.default import default_image
from user.serializer import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import response, permissions, status

from SD_backend.authentication import JWTAuthentication

# Create your views here.

@api_view(['GET'])
def user_list(request):
    user = request.user
    response = {}
    response_data=[]
    if not user.is_admin:
        response['message'] = 'You are not admin'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',20))
        is_DESC= request.GET.get('is_DESC',True) in ("True", "true", True)
        sort_by=str(request.GET.get('sort_by','date_join'))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    keyword = request.GET.get('keyword')

    user_list = User.objects.filter(is_admin=False).exclude(id=user.id)

    if keyword is not None:
        user_list=user_list.filter(Q(username__icontains=keyword) | Q(email__icontains=keyword) | Q(city__icontains=keyword) | Q(country__icontains=keyword))
    
    if is_DESC:
        user_list=user_list.order_by('-'+sort_by)
    else:
        user_list=user_list.order_by(sort_by)

    user_list=user_list.values("id",'username','email','gender','image','city','country',"is_active","date_join")

    try:
        paginator = Paginator(user_list, page_size)
        page_data=paginator.page(page)
        for item in page_data.object_list:
            response_data.append(item)
        response['data']=response_data
        response['max_page']=paginator.num_pages
        response['has_next']=page_data.has_next()
        response['has_previous']=page_data.has_previous()
        response['start_index']=page_data.start_index()
        response['end_index']=page_data.end_index()
    except Exception as e:
        print(e)
        response={}
        response['message'] = "Get user list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get user list success"
    return JsonResponse(response, safe=False)

    

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = json.loads(request.body)
    response = {}

    try:
        username = str(data.get("username"))
        password = str(data.get("password"))
        email = str(data.get("email"))
    except:
        response['message'] = 'User info missing'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).count() != 0:
        response['message'] = 'Email exists'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).count() != 0:
        response['message'] = 'Username exists'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(email,username,password)
        token = JWTAuthentication.create_jwt(user)
    except Exception as e:
        print(e)
        response['message'] = 'Registeration fail'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    response['message'] = "Registeration success"
    response['token'] = token

    return JsonResponse(response, safe=False)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = json.loads(request.body)
    response = {}

    try:
        username = str(data.get("username"))
        password = str(data.get("password"))
    except:
        response['message'] = 'User info missing'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(username=username).first()

    if user is None:
        response['message'] = 'User does not exist'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    if not (user.check_password(password)):
        response['message'] = 'wrong password'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        token = JWTAuthentication.create_jwt(user)
        user.last_login = timezone.now()
        user.save()
        response['id']=user.id
        response['username']=user.username
        response['message'] = "Log in success"
        response['token'] = token
    except Exception as e:
        print(e)
        response={}
        response['message'] = "Token generation fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    return JsonResponse(response, safe=False)

@api_view(['GET','PATCH'])
@permission_classes([AllowAny])
def profile(request):
    try:
        user, payload=JWTAuthentication().authenticate(request=request)
        is_login=True
    except Exception as e:
        user=None
        is_login=False
    response = {}

    if request.method == 'GET':

        try:
            user_id = int(request.GET.get('user_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        target_user= User.objects.filter(id=user_id).annotate(collection_count=Count('user_collection')).first()
        if target_user is None:
            response['message'] = "User does not exist"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_profile = UserSerializer(target_user, many=False).data
            user_profile['date_join']=target_user.date_join.strftime("%d/%m/%Y")
            user_profile['collection_count']=target_user.collection_count
        except Exception as e:
            print(e)
            response['message'] = "Get user profile fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if is_login:
            if Friend.objects.filter(from_user=user,to_user=target_user).exists():
                user_profile['is_friend']=True
            else:
                user_profile['is_friend']=False
        
        response['data']=user_profile
        response['message'] = "Get user profile success"

        return JsonResponse(response, safe=False)
    
    else:
        if user is None:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        data = json.loads(request.body)

        try:
            if data.get("gender") is not None:
                user.gender = data.get("gender")
            if data.get("city") is not None:
                user.city = data.get("city")
            if data.get("country") is not None:
                user.country = data.get("country")
            if data.get("image") is not None:
                user.image = data.get("image")
            user.save()
        except Exception as e:
            print(e)
            response['message'] = "Update user profile fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Update user profile success"
        return JsonResponse(response, safe=False)
    
@api_view(['PATCH'])
def change_password(request):
    data = json.loads(request.body)
    user = request.user
    response = {}

    try:
        old_password = str(data.get("old_password"))
        new_password = str(data.get("new_password"))
    except:
        response['message'] = 'Password missing'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    if not (user.check_password(old_password)):
        response['message'] = 'Wrong password'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user.set_password(new_password)
        user.save()
    except Exception as e:
        print(e)
        response['message'] = "Change password fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Change password success"
    return JsonResponse(response, safe=False)

@api_view(['POST'])
@permission_classes([AllowAny])
def forget_password(request):
    data = json.loads(request.body)
    response = {}
    response_data={}

    try:
        username = str(data.get("username"))
        email = str(data.get("email"))
    except:
        response['message'] = 'User info missing'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.filter(username=username,email=email).first()

    if user == None:
        response['message'] = 'User info does not match'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        new_password = User.objects.make_random_password()
        user.set_password(new_password)
        user.save()
    except Exception as e:
        print(e)
        response['message'] = "Generate random password fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response_data['password']=new_password
    response['data']=response_data
    response['message'] = "Generate random password success"
    return JsonResponse(response, safe=False)
    

@api_view(['GET'])
def search_user(request):
    user = request.user
    response = {}
    response_data=[]

    keyword = request.GET.get('keyword')
    search_by = request.GET.get('search_by',"all")
    
    user_list = User.objects.all()
    if search_by =="all":
        if (keyword is not None) and (keyword != ""):
            user_list = user_list.filter(Q(username__icontains=keyword) | Q(email__icontains=keyword) | Q(city__icontains=keyword) | Q(country__icontains=keyword))
    elif search_by == "username":
        if (keyword is not None) and (keyword != ""):
            user_list = user_list.filter(Q(username__icontains=keyword))
    elif search_by == "email":
        if (keyword is not None) and (keyword != ""):
            user_list = user_list.filter(Q(email__icontains=keyword))
    elif search_by == "city":
        if (keyword is not None) and (keyword != ""):
            user_list = user_list.filter(Q(city__icontains=keyword))
    elif search_by == "couuntry":
        if (keyword is not None) and (keyword != ""):
            user_list = user_list.filter(Q(couuntry__icontains=keyword))
    else:
        response['message'] = "Unknwon search by field"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    user_list=user_list.values("id",'username','email','gender','image','city','country').all()

    for item in user_list:
        if Friend.objects.filter(from_user=user,to_user_id=item['id']).exists():
            item['is_friend']=True
        else:
            item['is_friend']=False
        response_data.append(item)
    
    response['data']=response_data
    response['size']=len(response_data)
    response['message'] = "Search user success"
    return JsonResponse(response, safe=False)


@api_view(['POST','DELETE'])
def ban(request):
    user = request.user
    response = {}
    if not user.is_admin:
        response['message'] = 'You are not admin'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id=int(request.GET.get('user_id'))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    if user.id == user_id:
        response['message'] = "You cannot ban/unban yourself"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(id=user_id).first()

    if user is None:
        response['message'] = "User does not exist"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    if user.is_admin == True:
        response['message'] = "You cannot ban/unban an admin"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        if user.is_active == False:
            response['message'] = "User has already been banned"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user.is_active = False
            user.save()
        except Exception as e:
            print(e)
            response['message'] = "Ban user fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
        response['message'] = "Ban user success"
        return JsonResponse(response, safe=False)
    
    else:
        if user.is_active == True:
            response['message'] = "User has not been banned yet"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user.is_active = True
            user.save()
        except Exception as e:
            print(e)
            response['message'] = "Unban user fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
        response['message'] = "Unban user success"
        return JsonResponse(response, safe=False)

    