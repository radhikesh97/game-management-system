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
from collection.models import Collection,Component
from market.models import Market
from user.serializer import UserSerializer
from game.serializer import GameSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import response, permissions, status
from SD_backend.utils import is_visible

from SD_backend.authentication import JWTAuthentication
# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def game_list(request):
    response = {}

    try:
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',5))
        is_DESC= request.GET.get('is_DESC',True) in ("True", "true", True)
        sort_by=str(request.GET.get('sort_by','rate'))
        type = str(request.GET.get('type',"all"))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    keyword = request.GET.get('keyword')
    
    game_list = Game.objects

    if type != "all":
        game_list=game_list.filter(type=type)

    if (keyword is not None) and (keyword != ""):
        game_list=game_list.filter(Q(name__icontains=keyword) | Q(description__icontains=keyword))
    
    if is_DESC:
        game_list=game_list.order_by('-'+sort_by)
    else:
        game_list=game_list.order_by(sort_by)

    game_list = game_list.values('id','name','description','image','published_year','rate','type')
    print(len(game_list))

    try:
        paginator = Paginator(game_list, page_size)
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
        response['message'] = "Get game list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get game list success"
    return JsonResponse(response, safe=False)

@api_view(['GET'])
@permission_classes([AllowAny])
def game(request):
    try:
        user, payload=JWTAuthentication().authenticate(request=request)
        is_login=True
    except Exception as e:
        user=None
        is_login=False

    response = {}
    try:
        game_id=int(request.GET.get('game_id'))
    except:
        response['message'] = 'Game ID missing'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    game=Game.objects.filter(id=game_id).first()

    if game is None:
        response['message'] = 'Game does not exist'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    market = Market.objects.filter(game_id=game).values('price','link').first()
    
    
    game_serializer=GameSerializer(game,many=False)
    response_data=game_serializer.data
    if (user!=None):
        collection = Collection.objects.filter(user_id=user,game_id=game).first()
        if collection is not None:
            response_data['has_collection']=True
            response_data['collection_id']=collection.id
    else:
        response_data['has_collection']=False
    
    if market is not None:
        response_data['price']=market['price']
        response_data['link']=market['link']
    else:        
        response_data['price']=None
        response_data['link']=None
    
    response['data']=response_data
    response['message'] = "Get game list success"
    return JsonResponse(response, safe=False)
    

@api_view(['GET','PATCH'])
def rate(request):
    response = {}
    user=request.user

    if request.method == 'GET':
        try:
            game_id=int(request.GET.get('game_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        game = Game.objects.filter(id=game_id).first()

        if game is None:
            response['message'] = 'Game does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        rate= Rate.objects.filter(user_id=user.id,game_id=game.id).values("id","user_id","game_id","rate","time").first()
        
        if rate is None:
            response['data']= None
            response['message'] = 'You have not rated this game'
            return JsonResponse(response, safe=False)
        
        rate['time']=rate['time'].strftime("%d/%m/%Y")
        response['data']=rate
        response['message'] = "Get rate success"
        return JsonResponse(response, safe=False)
    
    else:
        try:
            game_id=int(request.GET.get('game_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        data = json.loads(request.body)
        try:
            rate_value=int(data.get('rate'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if (rate_value <0) or (rate_value >10):
            response['message'] = "Rate value invalid"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        game = Game.objects.filter(id=game_id).first()

        if game is None:
            response['message'] = 'Game does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        rate= Rate.objects.filter(user_id=user.id,game_id=game.id).first()
        
        try:
            if rate is None:
                rate=Rate(user_id=user,game_id=game,rate=rate_value)
            else:
                rate.rate=rate_value
            rate.save()
        except:
            response['message'] = "Rate game fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Rate game success"
        return JsonResponse(response, safe=False)
    

@api_view(['GET'])
@permission_classes([AllowAny])
def review_list(request):
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
    
    game=Game.objects.filter(id=game_id).first()

    if game is None:
        response['message'] = 'Game does not exist'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    review_list = Review.objects.filter(game_id=game)
    
    if is_DESC:
        review_list=review_list.order_by('-'+sort_by)
    else:
        review_list=review_list.order_by(sort_by)

    review_list = review_list.values('id','user_id','user_id__username','game_id','source','comment','visibility','time')

    try:
        for item in review_list:
            if not is_visible(item['visibility'],item['user_id'],is_login,user):
                continue
            item['time']=item['time'].strftime("%d/%m/%Y")
            item['username']=item['user_id__username']
            del item['user_id__username']
            del item['visibility']
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
        response['message'] = "Get review list fail"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    response['message'] = "Get review list success"
    return JsonResponse(response, safe=False)

@api_view(['GET'])
def my_review(request):
    user=request.user
    response = {}
    response_data=[]

    try:
        game_id=int(request.GET.get('game_id'))
    except Exception as e:
        print(e)
        response['message'] = "Param parsing error"
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    game=Game.objects.filter(id=game_id).first()

    if game is None:
        response['message'] = 'Game does not exist'
        return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
    
    review = Review.objects.filter(user_id=user,game_id=game).values('id','user_id','user_id__username','game_id','source','comment','visibility','time').first()
    if review is not None:
        review['username']=review['user_id__username']
        del review['user_id__username']

    response['data']=review
    response['message'] = "Get review list success"
    return JsonResponse(response, safe=False)

@api_view(['GET','POST','PATCH','DELETE'])
@permission_classes([AllowAny])
def review(request):
    try:
        user, payload=JWTAuthentication().authenticate(request=request)
        is_login=True
    except Exception as e:
        user=None
        is_login=False
    response = {}

    if request.method == 'GET':
        try:
            review_id=int(request.GET.get('review_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        review = Review.objects.filter(id=review_id).values('id','user_id','user_id__username','game_id','source','comment','visibility','time').first()

        if review is None:
            response['message'] = 'Review does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if not is_visible(review['visibility'],review['user_id'],is_login,user):
            response['message'] = 'This review is invisible to you'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        review['time']=review['time'].strftime("%d/%m/%Y")
        del review['visibility']
        review['username']=review['user_id__username']
        del review['user_id__username']
        response['data']=review
        response['message'] = "Get review success"
        return JsonResponse(response, safe=False)
        
    elif request.method == 'POST':
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        data = json.loads(request.body)
        try:
            game_id=int(data.get('game_id'))
            comment=str(data.get('comment'))
            visibility=int(data.get('visibility'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        game = Game.objects.filter(id=game_id).first()
        if game is None:
            response['message'] = 'Game does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if Review.objects.filter(user_id=user,game_id=game).exists():
            response['message'] = "You have reviewed this game"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if (comment == ""):
            response['message'] = 'Comment should not be blank'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        if (visibility > 3) or (visibility < 0):
            response['message'] = 'Wrong visibility code'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review(user_id=user,game_id=game,comment=comment,source="user comment",visibility=visibility)
            review.save()
        except Exception as e:
            print(e)
            response['message'] = "Add review fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['review_id']=review.id
        response['message'] = "Add review success"
        return JsonResponse(response, safe=False)
    
    elif request.method == 'PATCH':
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            review_id=int(request.GET.get('review_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        data = json.loads(request.body)
        try:
            comment=str(data.get('comment'))
            visibility=int(data.get('visibility'))
        except Exception as e:
            print(e)
            response['message'] = "Body parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        if (comment == ""):
            response['message'] = 'Comment should not be blank'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        if (visibility > 3) or (visibility < 0):
            response['message'] = 'Wrong visibility code'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        review = Review.objects.filter(id=review_id,user_id=user.id).first()
        if review is None:
            response['message'] = 'Review does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            review.comment=data.get('comment')
            review.visibility=data.get('visibility')
            review.save()
        except Exception as e:
            print(e)
            response['message'] = "Update review fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Update review success"
        return JsonResponse(response, safe=False)

    else:
        if not is_login:
            response['message'] = "User not login"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            review_id=int(request.GET.get('review_id'))
        except Exception as e:
            print(e)
            response['message'] = "Param parsing error"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        review = Review.objects.filter(id=review_id,user_id=user.id).first()
        if review is None:
            response['message'] = 'Review does not exist'
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            review.delete()
        except Exception as e:
            print(e)
            response['message'] = "Remove review fail"
            return JsonResponse(response, safe=False, status=status.HTTP_400_BAD_REQUEST)
        
        response['message'] = "Remove review success"
        return JsonResponse(response, safe=False)