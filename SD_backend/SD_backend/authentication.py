from datetime import datetime, timedelta

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q,F,Count
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed, ParseError

User = get_user_model()


class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # Extract the JWT from the Authorization header
        jwt_token = request.META.get('HTTP_AUTHORIZATION')
        if jwt_token is None:
            return None
        
        jwt_token = JWTAuthentication.get_the_token_from_header(jwt_token)  # clean the token

        # Decode the JWT and verify its signature
        try:
            payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.exceptions.InvalidSignatureError:
            raise AuthenticationFailed('Invalid signature')
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except:
            raise ParseError()

        # Get the user from the database
        id = payload.get('id')
        username = payload.get('username')
        email = payload.get('email')

        if (id is None) or (username is None) or (email is None):
            raise AuthenticationFailed('User info not found in JWT')

        user = User.objects.filter(id=id,username=username).annotate(collection_count=Count('user_collection')).first()
        if user is None:
            raise AuthenticationFailed('User not found')

        # Return the user and token payload
        return user, payload

    def authenticate_header(self, request):
        return 'Bearer'

    @classmethod
    def create_jwt(cls, user):
        # Create the JWT payload
        payload = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'exp': int((datetime.now() + settings.JWT_CONF['ACCESS_TOKEN_LIFETIME']).timestamp()),
        }

        # Encode the JWT with your secret key
        jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        return jwt_token

    @classmethod
    def get_the_token_from_header(cls, token):
        token = token.replace('Bearer', '').replace(' ', '')  # clean the token
        return token
