# Generated by Django 4.1.7 on 2023-04-16 16:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_alter_game_description_alter_game_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='rate_number',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='rate',
            name='rate',
            field=models.IntegerField(),
        ),
    ]
