from django.db import models
from user.models import User
from game.models import Game

# Create your models here.
class Forum(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_forum')
    game_id=models.ForeignKey(Game, on_delete=models.CASCADE,related_name='game_forum')

    title = models.CharField(max_length=100,null=False,blank=False)
    text = models.CharField(max_length=1023,null=False,blank=False)
    time = models.DateTimeField(auto_now = True, null=False,blank=False)
    like = models.IntegerField(null=False,blank=False,default=0)
    visibility = models.IntegerField(null=False,blank=False,default=0) #0-public;1-login_user;2-friend;3-private

    class Meta:
        db_table = 'forum'

class Reply(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_reply')
    forum_id=models.ForeignKey(Forum, on_delete=models.CASCADE,related_name='forum_reply')

    text = models.CharField(max_length=1023,null=False,blank=False)
    time = models.DateTimeField(auto_now = True, null=False,blank=False)
    like = models.IntegerField(null=False,blank=False,default=0)
    visibility = models.IntegerField(null=False,blank=False,default=0) #0-public;1-login_user;2-friend;3-private

    class Meta:
        db_table = 'reply'

class Forum_Like(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_forum_like')
    forum_id=models.ForeignKey(Forum, on_delete=models.CASCADE,related_name='forum_like')
    time = models.DateTimeField(auto_now = True, null=False,blank=False)

    class Meta:
        db_table = 'forum_like'

class Reply_Like(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id=models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_reply_like')
    reply_id=models.ForeignKey(Reply, on_delete=models.CASCADE,related_name='reply_like')
    time = models.DateTimeField(auto_now = True, null=False,blank=False)

    class Meta:
        db_table = 'reply_like'
