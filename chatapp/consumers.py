import json
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from icecream import ic
from .models import *

from fcm_django.models import FCMDevice
from firebase_admin.messaging import Message as Msg



class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # print(self.scope['user'])
        self.room_name = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = 'chat_%s' % self.room_name
        self.user = self.scope['user']
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
 
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'type' in data:
            if data['type'] == 'markread':
                print('hi')
                await self.mark_read(data['room_id'])
                await self.channel_layer.group_send(
                    self.room_group_name,{
                        'type': 'send_read_status',
                        'user': data['user'],
                        'room_id': data['room_id'],
                        'do': 'markread',
                    }
                )
            else:
                await self.channel_layer.group_send(
                    self.room_group_name,{
                        'type': 'show_typing_status',
                        'user': data['user'],
                        'room_id': data['room_id'],
                        'do': data['type'],
                    }
                )
        # ic(data)
        else:
            message = data["message"]
            room_id = data["room_id"]
            user = data["user"]

            await self.save_message(user, room_id, message)
            
            await self.channel_layer.group_send(
                self.room_group_name,{
                    'type': 'chat_message',
                    'message': message,
                    'user': user,
                    'room_id': room_id,
                }
            )
            await self.send_notification(user, room_id, message)   
        

    async def chat_message(self, event):
        message = event['message']
        user = event['user']
        room_id = event['room_id']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
            'room_id': room_id,
            'time': str(timezone.now().strftime("%I.%M %p")),
        }))
      
    async def show_typing_status(self, data):
        await self.send(text_data=json.dumps({
            'type': data['do'],
            'user': data['user'],
            'room_id': data['room_id'],
        }))

    async def send_read_status(self, data):
        await self.send(text_data=json.dumps({
            'type': data['do'],
            'user': data['user'],
            'room_id': data['room_id'],
        }))
             
    
    @sync_to_async
    def save_message(self, user, room, message):
        room = Room.objects.get(pk = room)
        room.last_message = message
        room.save()
        message = Message.objects.create(user = User.objects.get(pk = user), room=room, content=message)
        UnreadMessages.objects.create(message = message, room = room)


    @sync_to_async
    def send_notification(self, user, room, message):
        # ic(Room.objects.filter(pk = room).values('auth_user'))
        authusers = Room.objects.get(pk = room).auth_user.exclude(id = user)     
        fcm_devices = FCMDevice.objects.filter(user__in=authusers.values_list('id', flat = True)) 
        print(authusers, fcm_devices)  
        fcm_devices.send_message(Msg(data={'title':authusers.values_list('first_name', flat = True)[0].capitalize(), 'body': message, 'image': '/media/'+authusers[0].customuser_set.all().values_list('image', flat = True)[0], "room": room}))

    @sync_to_async
    def mark_read(self, room):
        UnreadMessages.objects.filter(room = room).delete()
