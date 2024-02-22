from django.db import models
from game.models import Game

# Create your models here.
class Market(models.Model):
    id = models.BigAutoField(primary_key=True)
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE,related_name='game_market')
    price = models.CharField(max_length=40,null=True)
    link = models.CharField(max_length=255,null=False)

    class Meta:
        db_table = 'market'