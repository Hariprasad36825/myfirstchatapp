from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.cache import cache
import datetime
from django.conf import settings

class CustomUser(models.Model):
    user   = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='./images',  default="Default_avatar.png")
    about = models.CharField(max_length=255, blank=True, null=True)
    friends = models.ManyToManyField(User, related_name='friends', blank=True)

    def __str__(self):
        return self.user.username

    def last_seen(self):
        return cache.get('seen_%s' % self.user.username)

    def online(self):
        if self.last_seen():
            now = timezone.now()
            if now > self.last_seen() + datetime.timedelta(
                         seconds=settings.USER_ONLINE_TIMEOUT):
                return False
            else:
                return True
        else:
            return False

class Room(models.Model):
    room_id = models.AutoField(primary_key=True)
    room_name = models.CharField(max_length=20, null=True, blank=True)
    auth_user = models.ManyToManyField(User, blank=True)
    last_message = models.CharField(max_length=20, null=True, blank=True)
    date_added = models.DateTimeField(default=timezone.now, null=True, blank=True)

    def __str__(self):
        return str(self.room_id)

# Create your models here.
class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null = True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    content = models.TextField()
    date_added = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ('-date_added',)
    

class UnreadMessages(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, null=True)
