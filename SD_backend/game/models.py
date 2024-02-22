from django.db import models
from django.conf import settings
from user.models import User

# Create your models here.
class Game(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=1000,null=False,blank=False)
    description=models.TextField(max_length=10000,null=False,blank=False)
    image = models.CharField(max_length=255,null=True)
    published_year = models.IntegerField(null=True)

    min_players = models.IntegerField(null=True)
    max_players = models.IntegerField(null=True)
    min_playtime = models.IntegerField(null=True)
    max_playtime = models.IntegerField(null=True)
    min_age = models.IntegerField(null=False, default=0)

    rate = models.FloatField(null=False,blank=False)
    rate_number = models.IntegerField(null=False,default=0)
    type = models.CharField(max_length=100,null=True)

    class Meta:
        db_table = 'game'

class Rate(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_rate')
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE,related_name='game_rate')
    rate = models.IntegerField(null=False)
    time = models.DateTimeField(auto_now = True, null=False,blank=False)

    class Meta:
        db_table = 'rate'

class Review(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_review')
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE,related_name='game_review')
    source = models.CharField(max_length=100,null=False,blank=False)
    comment = models.CharField(max_length=255,null=False,blank=False)
    visibility = models.IntegerField(null=False,blank=False,default=0) #0-public;1-login_user;2-friend;3-private
    time = models.DateTimeField(auto_now = True, null=False,blank=False)
    
    class Meta:
        db_table = 'review'