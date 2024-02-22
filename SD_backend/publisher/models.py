from django.db import models
from game.models import Game

# Create your models here.
class Publisher(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100,null=False)
    description=models.CharField(max_length=1023,null=False)

    class Meta:
        db_table = 'publisher'

class Game_Publisher(models.Model):
    id = models.BigAutoField(primary_key=True)
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE)
    publisher_id=models.ForeignKey(Publisher, on_delete=models.CASCADE)

    class Meta:
        db_table = 'game_publisher'

class Publisher_Document(models.Model):
    id = models.BigAutoField(primary_key=True)
    publisher_id=models.ForeignKey(Publisher, on_delete=models.CASCADE,related_name='publisher_document')
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE,related_name='game_document')
    path = models.CharField(max_length=1023,null=False)
    time = models.DateTimeField(auto_now = True, null=False,blank=False)

    class Meta:
        db_table = 'publisher_document'

class Publisher_FAQ(models.Model):
    id = models.BigAutoField(primary_key=True)
    publisher_id=models.ForeignKey(Publisher, on_delete=models.CASCADE,related_name='publisher_FAQ')
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE,related_name='game_FAQ')
    text = models.CharField(max_length=2047,null=False,blank=False)

    class Meta:
        db_table = 'publisher_faq'