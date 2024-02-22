import json
from django.shortcuts import render
from rest_framework import viewsets,status
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q,F
from django.db import transaction, DatabaseError

from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from django.core.paginator import Paginator

from user.models import User,UserManager,Friend
from club.models import Club
from game.models import Game
from collection.models import Collection,Component
from user.serializer import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import response, permissions, status

from SD_backend.authentication import JWTAuthentication


# Create your views here.
@api_view(['GET'])
@permission_classes([AllowAny])
def club_list(request):
    response = {}

    try:
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',5))
        is_DESC= request.GET.get('is_DESC',True) in ("True", "true", True)
        sort_by=str(request.GET.get('sort_by','name'))
        search_by = request.GET.get('search_by',"all")
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    keyword = request.GET.get('keyword')
    
    club_list=Club.objects
    if search_by =="all":
        if (keyword is not None) and (keyword != ""):
            club_list = club_list.filter(Q(name__icontains=keyword) | Q(description__icontains=keyword) | Q(city__icontains=keyword) | Q(country__icontains=keyword))
    elif search_by == "name":
        if (keyword is not None) and (keyword != ""):
            club_list = club_list.filter(Q(name__icontains=keyword))
    elif search_by == "description":
        if (keyword is not None) and (keyword != ""):
            club_list = club_list.filter(Q(description__icontains=keyword))
    elif search_by == "city":
        if (keyword is not None) and (keyword != ""):
            club_list = club_list.filter(Q(city__icontains=keyword))
    elif search_by == "couuntry":
        if (keyword is not None) and (keyword != ""):
            club_list = club_list.filter(Q(couuntry__icontains=keyword))
    else:
        response['message'] = "Unknwon search by field"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    if is_DESC:
        club_list=club_list.order_by('-'+sort_by)
    else:
        club_list=club_list.order_by(sort_by)

    print(len(club_list))
    
    try:
        paginator = Paginator(club_list, page_size)
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
        response['message'] = "Get club list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get club list success"
    return JsonResponse(response, safe=False)

