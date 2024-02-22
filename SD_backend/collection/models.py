from django.db import models
from user.models import User
from game.models import Game
from user.default import default_image

# Create your models here.


class Collection(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_collection')
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE,related_name='game_collection')
    name = models.CharField(max_length=100,null=False,blank=False)
    note = models.CharField(max_length=1023,null=True)
    play_time = models.IntegerField(null=False,blank=False,default=0)
    time = models.DateTimeField(auto_now = True, null=False,blank=False)

    class Meta:
        db_table = 'collection'

class Component(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_component')
    collection_id=models.ForeignKey(Collection, on_delete=models.CASCADE,related_name='collection_component')
    type = models.CharField(max_length=100,null=True)
    number = models.IntegerField(null=False,blank=False,default=0)
    time = models.DateTimeField(auto_now = True, null=False,blank=False)
    name = models.CharField(max_length=100,null=False,blank=False)
    description = models.CharField(max_length=1023,null=True)
    image = models.TextField(max_length=65535,null=True,blank=True,default=default_image)

    class Meta:
        db_table = 'component'