from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.conf import settings
from user.default import default_image

# Create your models here.


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, username, password):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        
        user = self.model(username = username, email = email)
        
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        
        user = self.model(username = username, email = email)
        user.set_password(password)
        user.is_admin = True
        user.save(using=self._db)
        return user
    

class User(AbstractBaseUser):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=40,null=False,blank=False,unique=True)
    email = models.CharField(max_length=100,null=False,blank=False)
    gender = models.IntegerField(null=True,blank=True)
    city = models.CharField(max_length=40,null=True,blank=True)
    country = models.CharField(max_length=40,null=True,blank=True)
    image = models.TextField(max_length=65535,null=True,blank=True,default=default_image)
    is_admin = models.BooleanField(null=False,blank=True,default=False)
    is_active = models.BooleanField(null=False,blank=True,default=True)
    date_join = models.DateTimeField(auto_now = False,auto_now_add = True, null=False,blank=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin

    class Meta:
        db_table = 'user'

class Friend(models.Model):
    id = models.BigAutoField(primary_key=True)
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='from_user')
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='to_user')
    time = models.DateTimeField(auto_now = False,auto_now_add = True, null=False,blank=False)

    class Meta:
        db_table = 'friend'
