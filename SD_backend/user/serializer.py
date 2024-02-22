from rest_framework import serializers
from user.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        #fields = ['id','username','email','gender','city','country','image','is_admin','is_active','date_join']
        exclude = ['password']