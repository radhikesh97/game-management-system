# Generated by Django 4.1.7 on 2023-04-08 00:30

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('game', '0002_rate_review_delete_game_publisher_delete_publisher'),
    ]

    operations = [
        migrations.CreateModel(
            name='Forum',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=100)),
                ('text', models.CharField(max_length=1023)),
                ('time', models.DateTimeField(auto_now=True)),
                ('like', models.IntegerField(default=0)),
                ('game_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_forum', to='game.game')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_forum', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'forum',
            },
        ),
        migrations.CreateModel(
            name='Reply',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('text', models.CharField(max_length=1023)),
                ('time', models.DateTimeField(auto_now=True)),
                ('like', models.IntegerField(default=0)),
                ('forum_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='forum_reply', to='forum.forum')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_reply', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reply',
            },
        ),
        migrations.CreateModel(
            name='Reply_Like',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('time', models.DateTimeField(auto_now=True)),
                ('reply_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reply_like', to='forum.reply')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_reply_like', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reply_like',
            },
        ),
        migrations.CreateModel(
            name='Forum_Like',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('time', models.DateTimeField(auto_now=True)),
                ('forum_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='forum_like', to='forum.forum')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_forum_like', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'forum_like',
            },
        ),
    ]
