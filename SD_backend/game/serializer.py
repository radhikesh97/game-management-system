from rest_framework import serializers
from game.models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        #fields = ['id','username','email','gender','city','country','image','is_admin','is_active','date_join']
        #exclude = ['password']
        fields = '__all__'