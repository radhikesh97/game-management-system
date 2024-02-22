# Generated by Django 4.1.7 on 2023-04-19 08:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('game', '0005_game_rate_number_alter_rate_rate'),
    ]

    operations = [
        migrations.CreateModel(
            name='Market',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('price', models.CharField(max_length=40, null=True)),
                ('link', models.CharField(max_length=255)),
                ('game_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_market', to='game.game')),
            ],
            options={
                'db_table': 'market',
            },
        ),
    ]
