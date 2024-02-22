from django.db import models
from user.default import default_image

# Create your models here.
class Club(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=1000,null=False,blank=False)
    description=models.TextField(max_length=10000,null=False,blank=False)
    city = models.CharField(max_length=100,null=True,blank=True)
    country = models.CharField(max_length=100,null=True,blank=True)
    image = models.TextField(max_length=65535,null=True,blank=True,default=default_image)

    class Meta:
        db_table = 'club'