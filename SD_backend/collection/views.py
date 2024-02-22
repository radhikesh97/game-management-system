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
from game.models import Game
from collection.models import Collection,Component
from user.serializer import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import response, permissions, status

@api_view(['GET'])
def collection_list(request):
    user = request.user
    response = {}
    response_data=[]

    try:
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',20))
        is_DESC= request.GET.get('is_DESC',True) in ("True", "true", True)
        sort_by=str(request.GET.get('sort_by','time'))
        type = str(request.GET.get('type',"all"))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    keyword = request.GET.get('keyword')

    collection_list=Collection.objects.filter(user_id=user.id)

    if type != "all":
        collection_list=collection_list.filter(game_id__type=type)
    
    if (keyword is not None) and (keyword != ""):
        if keyword != "--A-L-L--":
            collection_list=collection_list.filter(Q(name__icontains=keyword) | Q(game_id__description__icontains=keyword))
    
    if is_DESC:
        collection_list=collection_list.order_by('-'+sort_by)
    else:
        collection_list=collection_list.order_by(sort_by)

    collection_list=collection_list.values('id','game_id','game_id__name','game_id__image','game_id__type','time')

    
    try:
        paginator = Paginator(collection_list, page_size)
        page_data=paginator.page(page)
        for item in page_data.object_list:
            tmp={}
            tmp['id']=item['id']
            tmp['game_id']=item['game_id']
            tmp['game_name'] = item['game_id__name']
            tmp['game_image'] = item['game_id__image']
            tmp['game_type'] = item['game_id__type']
            tmp['time']=item['time'].strftime("%d/%m/%Y")
            response_data.append(tmp)
        response['data']=response_data
        response['max_page']=paginator.num_pages
        response['has_next']=page_data.has_next()
        response['has_previous']=page_data.has_previous()
        response['start_index']=page_data.start_index()
        response['end_index']=page_data.end_index()

    except Exception as e:
        print(e)
        response={}
        response['message'] = "Get collection list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get game collection list success"
    return JsonResponse(response, safe=False)


# Create your views here.
@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def collection(request):
    user = request.user
    response = {}

    if request.method == 'GET':
        response_data={}

        try:
            collection_id=int(request.GET.get('collection_id'))
        except:
            response['message'] = 'Collection ID missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        collection = Collection.objects.filter(user_id=user.id,id=collection_id).values('id','game_id','game_id__name','game_id__image','game_id__type','note','play_time','time').first()

        if collection is None:
            response['message'] = 'You do not have this game collection'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response_data['id']=collection['id']
        response_data['game_id']=collection['game_id']
        response_data['game_name'] = collection['game_id__name']
        response_data['game_image'] = collection['game_id__image']
        response_data['game_type'] = collection['game_id__type']
        response_data['note'] = collection['note']
        response_data['play_time']=collection['play_time']
        response_data['time'] = collection['time'].strftime("%d/%m/%Y")
        
        response['data']=response_data
        response['message'] = "Get game collection success"
        return JsonResponse(response, safe=False)

    elif request.method == 'POST':
        data = json.loads(request.body)
        try:
            game_id=int(data.get('game_id'))
        except:
            response['message'] = 'Game ID missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        game=Game.objects.filter(id=game_id).first()

        if game is None:
            response['message'] = 'Game does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if Collection.objects.filter(user_id=user,game_id=game).count() !=0:
            response['message'] = 'You have this game collection already'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            collection=Collection(user_id=user,game_id=game,name=game.name)
            collection.save()
        except Exception as e:
            print(e)
            response['message'] = "Add collection fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Add game collection success"
        return JsonResponse(response, safe=False)

    elif request.method == 'PATCH':
        data = json.loads(request.body)

        try:
            collection_id=int(request.GET.get('collection_id'))
        except:
            response['message'] = 'Collection ID missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        collection = Collection.objects.filter(user_id=user.id,id=collection_id).first()
        if collection is None:
            response['message'] = 'You do not have this game collection'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            collection.note=data.get('note')
            collection.play_time=data.get('play_time')
            collection.save()
        except Exception as e:
            print(e)
            response['message'] = "Update game collection fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Update game collection success"
        return JsonResponse(response, safe=False)
        
    if request.method == 'DELETE':
        response_data={}

        try:
            collection_id=int(request.GET.get('collection_id'))
        except:
            response['message'] = 'Collection ID missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        collection = Collection.objects.filter(user_id=user.id,id=collection_id).first()

        if collection is None:
            response['message'] = 'You do not have this game collection'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            collection.delete()
        except Exception as e:
            print(e)
            response['message'] = "Remove collection fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        response['message'] = "Remove collection success"
        return JsonResponse(response, safe=False)
    

@api_view(['GET'])
def component_list(request):
    user = request.user
    response = {}
    response_data=[]

    try:
        collection_id=int(request.GET.get('collection_id'))
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',20))
        is_DESC= request.GET.get('is_DESC',True) in ("True", "true", True)
        sort_by=str(request.GET.get('sort_by','time'))
        type = str(request.GET.get('type',"all"))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

    component_list=Component.objects.filter(user_id=user.id,collection_id=collection_id)

    if type != "all":
        component_list.filter(type=type)

    if is_DESC:
        component_list=component_list.order_by("-"+sort_by)
    else:
        component_list=component_list.order_by(sort_by)

    component_list=component_list.values('id','collection_id','name','description','image','type','number','time')
    
    try:
        paginator = Paginator(component_list, page_size)
        page_data=paginator.page(page)
        for item in page_data.object_list:
            item['time']=item['time'].strftime("%d/%m/%Y")
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
        response['message'] = "Get component list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get component list success"
    return JsonResponse(response, safe=False)

@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def component(request):
    user = request.user
    response = {}

    if request.method == 'GET':
        try:
            component_id=int(request.GET.get('component_id'))
        except:
            response['message'] = 'Component ID missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        component = Component.objects.filter(user_id=user.id,id=component_id).values('id','collection_id','name','description','image','type','number','time').first()

        if component is None:
            response['message'] = 'You do not have this game component'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        component['time']=component['time'].strftime("%d/%m/%Y")
        response['data']=component
        response['message'] = "Get game coponent success"
        return JsonResponse(response, safe=False)

    elif request.method == 'POST':
        data = json.loads(request.body)

        try:
            collection_id=int(data.get('collection_id'))
            type=str(data.get('type'))
            number=int(data.get('number'))
            name=str(data.get('name'))
            description=str(data.get('description'))
            image=str(data.get('image'))
        except:
            response['message'] = 'Body parsing error'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        collection=Collection.objects.filter(id=collection_id).first()

        if collection is None:
            response['message'] = 'Collection does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            component=Component(user_id=user,collection_id=collection,type=type,number=number,name=name,description=description,image=image)
            component.save()
        except Exception as e:
            print(e)
            response['message'] = "Add component fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Add component success"
        return JsonResponse(response, safe=False)

    elif request.method == 'PATCH':
        data = json.loads(request.body)
        try:
            component_id=int(request.GET.get('component_id'))
        except:
            response['message'] = 'Component ID missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        component = Component.objects.filter(user_id=user.id,id=component_id).first()
        if component is None:
            response['message'] = 'You do not have this game component'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if data.get('type') is not None:
                component.type=data.get('type')
            if data.get('number') is not None:
                component.number=int(data.get('number'))
            if data.get('name') is not None:
                component.name=data.get('name')
            if data.get('description') is not None:
                component.description=data.get('description')
            if data.get('image') is not None:
                component.image=data.get('image')
            component.save()
        except Exception as e:
            print(e)
            response['message'] = "Update game component fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Update game component success"
        return JsonResponse(response, safe=False)
        
    if request.method == 'DELETE':
        try:
            component_id=int(request.GET.get('component_id'))
        except:
            response['message'] = 'Component ID missing'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        component = Component.objects.filter(user_id=user.id,id=component_id).first()

        if component is None:
            response['message'] = 'You do not have this game component'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            component.delete()
        except Exception as e:
            print(e)
            response['message'] = "Remove component fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        response['message'] = "Remove component success"
        return JsonResponse(response, safe=False)
    