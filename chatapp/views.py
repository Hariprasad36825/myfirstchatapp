import django
from django.contrib.auth.models import User
from django.core.files import storage
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND, HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS, HTTP_500_INTERNAL_SERVER_ERROR, HTTP_503_SERVICE_UNAVAILABLE
from .serializer import RegisterSerializer
from django.shortcuts import redirect, render
from .models import *
from rest_framework import generics
from rest_framework.response import Response
from django.contrib.auth import authenticate, logout
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
import traceback

from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from collections import OrderedDict
from icecream import ic

from django.core.files.storage import default_storage
from django.core.files.storage import FileSystemStorage
import os
import cv2
import base64
from django.core import files

tmp_profile_image_name = "temp_profile_image.png"


def logout_view(request):
    logout(request)


class Login(APIView):
    def post(self, request):
        data = request.data
        user = authenticate(username=data['email'], password=data['password'])

        if user is not None:
            django.contrib.auth.login(request, user)
            # print(user)
            return Response({"url": "/"}, HTTP_200_OK)
        else:
            try:
                if User.objects.get(username=data['email']).is_active:
                    return Response({"message": "password doesn't match"}, HTTP_403_FORBIDDEN)
                else:
                    return Response({"url": "/mailsent"}, HTTP_401_UNAUTHORIZED)
            except:
                traceback.print_exc()
                return Response({"message": "user not found"}, HTTP_500_INTERNAL_SERVER_ERROR)

# Create your views here.


def index(request):
    print(request.user)
    return render(request, 'chat/index.html')


def register(request):
    return render(request, 'chat/register.html')


def mailsent(request):
    return render(request, 'chat/mailsent.html')


def successful(request):
    return render(request, 'chat/successmsg.html')


@login_required(login_url='/login')
def room(request, room_id):
    username = request.user.username
    messages = Room.objects.get(pk=room_id).message_set()[:25]
    user = request.user.username
    print(messages)
    return render(request, 'chat/room.html', {'room_name': room_id, 'username': username, 'messages': messages, 'user': user})


def login(request):
    return render(request, 'chat/login.html')


@login_required(login_url='/login')
def chat(request):
    username = request.user.username
    # print(username)
    name = request.user.first_name + ' ' + request.user.last_name if request.user.first_name + \
        ' ' + request.user.last_name != '' else username
    customuser = ic(request.user.customuser_set.all()[0])
    about = ic(customuser.about)
    profile_pic = ic(str(customuser.image))
    friends = ic(customuser.friends.all())
    result = list(ic(customuser.friends.all().values(
        'id', 'username', 'first_name', 'last_name')))
    chats = result.copy()

    for i, user in enumerate(friends):
        tmp = ic(user.customuser_set.all().values('image', 'about', 'user')[0])
        room = ic(Room.objects.filter(auth_user=user.id).filter(auth_user=request.user.id).values(
            'room_id', 'last_message', 'date_added', 'room_name'))[0]
        tmp['room_id'] = room['room_id']
        ic(user.customuser_set.all()[0].last_seen())
        tmp['status'] = 'online' if ic(user.customuser_set.all()[
                                       0].online()) else 'offline'
        result[i].update(tmp)
        chats[i].update(room)
        chats[i].update(tmp)
    chats = sorted(chats, key=lambda i: i['date_added'])

    friends = {}
    for i in list(ic(result)):
        if i['username'][0].upper() in friends:
            friends[i['username'][0].upper()].append(i)
        else:
            friends[i['username'][0].upper()] = [i]
    # OrderedDict(sorted(friends.items()))
    friends = OrderedDict(sorted(friends.items()))
    ic(friends)
    return render(request, 'chat/chat.html', {'friends': friends, 'name': name, 'username': username, 'email': request.user.email, 'id': request.user.id, 'about': about, 'profile_pic': profile_pic, 'chats': chats})


def forgotpassword(request):
    return render(request, 'chat/forgot_password.html')


def changepassword(request, id, token):
    try:
        user = User.objects.get(pk=id)
        if (user and default_token_generator.check_token(user, token)):
            return render(request, 'chat/change_password.html')
        else:
            return Response({"message": "nice try"}, HTTP_403_FORBIDDEN)
    except:
        return Response(HTTP_500_INTERNAL_SERVER_ERROR)


def send_verificationLink_email(request, user, subject, type):
    try:
        context = {
            'request': request,
            'protocol': request.scheme,
            'username': user.first_name if user.first_name != '' else user.username,
            'domain': request.META['HTTP_HOST'],
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
            'type': type
        }
        email = render_to_string('link_template/validationLink.txt', context)

        send_mail(subject, email, "demo", [user.email])
        print("email sent")
    except:
        traceback.print_exc()
        return Response({"status": "error"})


def activate(request, uidb64, token, type):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        traceback.print_exc()
        user = None
    # print(user)
    if type == "activation":
        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect('/successful')
        else:
            return Response({"message": 'Activation link is invalid!'})

    if type == "verification":
        if user is not None and default_token_generator.check_token(user, token):
            return redirect('/changepassword/{}/{}'.format(uid, token))
        else:
            return Response({"message": 'Activation link is invalid!'})

    else:
        return Response({"message": 'Activation link is invalid!'})


class Register(generics.CreateAPIView):
    def post(self, request):
        data = ic(request.data)
        if User.objects.filter(username=data['username']).exists():
            return Response({"message": "Email already exists"}, HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS)
        serializer = RegisterSerializer(
            data=data, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            user = User.objects.get(username=data['username'])
            CustomUser.objects.create(user=user, about=data['about'])
            send_verificationLink_email(
                request, user, "Action Required to Complete the Account Creation", 'activation')
            return Response(serializer.data)
        return Response({"message": "server error"}, HTTP_503_SERVICE_UNAVAILABLE)


class Send_link(APIView):
    def post(self, request):
        email = request.data["email"]
        try:
            user = User.objects.get(email=email)
            send_verificationLink_email(
                request, user, "Click below to change Password", 'verification')
            return Response({"success": "Verification link has been sent to your mail please verify"}, HTTP_200_OK)
        except:
            return Response({"message": "user not found"}, HTTP_404_NOT_FOUND)


class ChangePassword(APIView):
    def post(self, request):
        data = request.data
        try:
            user = User.objects.get(pk=data["pk"])
            user.set_password(data['password'])
            user.save()
            return Response({"redirect": "You will be redirected shortly"}, HTTP_200_OK)
        except:
            traceback.print_exc()
            return Response({"message": "user not found"}, HTTP_404_NOT_FOUND)


class ChangePassword(APIView):
    def post(self, request):
        data = request.data
        try:
            user = User.objects.get(pk=data["pk"])
            user.set_password(data['password'])
            user.save()
            return Response({"redirect": "You will be redirected shortly"}, HTTP_200_OK)
        except:
            traceback.print_exc()
            return Response({"message": "user not found"}, HTTP_404_NOT_FOUND)


class Discover(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = ic(request.data)

        users = User.objects.filter(username__contains=data["input"]).exclude(pk__in=[ic(
            request.user.pk), ic(CustomUser.objects.filter(user=request.user).values_list('friends'))])
        result = list(ic(users.values('id', 'username')))
        for i, user in enumerate(users):
            print(user.customuser_set.all().values('image', 'about')[0])
            tmp = ic(user.customuser_set.all().values('image', 'about')[0])
            ic(tmp)
            result[i].update(tmp)

        ic(result)
        if not result:
            # print(1/0)
            result.append({"message": 0})
        return Response(result, HTTP_200_OK)


class Invite(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data["email"]
        subject = str("""
                    Hi there,
                        Your Friend {} is inviting you to use Chaify

                    click here - http://localhost:8000/

                    about us - Chatify is an platform to chat securely using django

                    you're receiving this email because it is solely suggested by your friend 
        """.format(request.user.first_name))

        send_mail('Invitation from Chatify by {}'.format(
            request.user.first_name), subject, "demo", [email])

        return Response(HTTP_200_OK)


class CreateRoom(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            user = User.objects.get(pk=data['user_id'])
            customusers = CustomUser.objects.filter(
                user__in=[user, request.user])
            for i in customusers:
                i.friends.add(user if user != i.user else request.user)
                i.save()
            room = Room.objects.create()

            room.auth_user.add(user)
            room.auth_user.add(request.user)
            # print(room)

            room.save()
            return Response({"room": room.room_id}, HTTP_200_OK)
        except:
            traceback.print_exc()
            return Response({'message': 'try after some time'}, HTTP_500_INTERNAL_SERVER_ERROR)


class GetMessages(APIView):
    permission_classes = [IsAuthenticated]
    ic.disable()

    def post(self, request):
        try:
            room_id = request.data['room_id']
            upto = request.data['upto']
            tmp = Room.objects.get(room_id=room_id)
            unread = ic(tmp.unreadmessages_set.all())
            unread_id = ic(unread.values_list('message', flat=True))
            rooms = tmp.message_set.all()
            # print(rooms.values())
            print(len(rooms), upto)
            tmp = upto if (len(rooms) - upto) > 0 else len(rooms)
            room = ic(rooms.values()[upto-50:tmp])
            messages = {}
            fl = 0
            fl1 = 0
            # ic.enable()
            for i, message in enumerate(room):

                date = message['date_added'].strftime("%d %b %y")
                date = date if timezone.now().strftime("%d %b %y") != date else 'Today'
                date = 'Unread messages' if message['id'] in unread_id else date
                if date == 'Unread messages' and not fl and upto == 50:
                    if message['user_id'] == request.user.id:
                        message['symbol'] = '&nbsp;<span class="material-icons-outlined" id="check_circle">check_circle</span>'
                        fl = 1
                    else:
                        message['symbol'] = ''
                elif date != 'Unread messages' and not fl1 and upto == 50:
                    if ic(message['user_id']) == ic(request.user.id):
                        message['symbol'] = '&nbsp;<span class="material-icons-outlined" id="visibility">visibility</span>'
                        fl1 = 1
                    else:
                        message['symbol'] = ''
                else:
                    message['symbol'] = ''

                time = message['date_added'].strftime("%I.%M %p")
                message['time'] = time

                if date in messages:
                    messages[date].append(message)
                else:
                    messages[date] = [message]
                # print(message)
            # print(messages)
            if tmp != upto:
                messages['End of the chat History'] = []
            return Response({'messages': messages}, HTTP_200_OK)

        except:
            traceback.print_exc()
            return Response({'message': 'try after some time'}, HTTP_500_INTERNAL_SERVER_ERROR)
# ic.diable()


class SaveInfo(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data

            user = request.user
            user.first_name = data['name']
            user.last_name = ''
            user.save()

            customuser = ic(user.customuser_set.all()[0])
            customuser.about = data['about']
            customuser.save()
            return Response({'message': 'changed successfully'}, HTTP_200_OK)
        except:
            traceback.print_exc()
            return Response(HTTP_500_INTERNAL_SERVER_ERROR)


class SavePassword(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data

            user = request.user
            if user.check_password(data['password']):
                user.set_password(data['newpass'])
                user.save()
            else:
                return Response({'message': 'Incorrect current password'}, HTTP_401_UNAUTHORIZED)

            return Response({'message': 'changed successfully'}, HTTP_200_OK)
        except:
            traceback.print_exc()
            return Response(HTTP_500_INTERNAL_SERVER_ERROR)


class CropImage(APIView):
    def save_tmp_image_at_backend(self, imagestr, user):
        INCORRECT_PADDING_EXCEPTION = 'Incorrect padding'
        try:
            if not os.path.exists(settings.TEMP):
                os.mkdir(settings.TEMP)
            if not os.path.exists(settings.TEMP+'/'+str(user.id)):
                os.mkdir(settings.TEMP+'/'+str(user.id))
            url = os.path.join(settings.TEMP+'/'+str(user.id),
                               tmp_profile_image_name)
            storage = FileSystemStorage(location=url)
            image = base64.b64decode(imagestr)
            print(image)
            with storage.open('', 'wb+') as destination:
                destination.write(image)
                destination.close()
            return url

        except Exception as e:
            traceback.print_exc()
            if str(e) == INCORRECT_PADDING_EXCEPTION:
                imagestr += '=' * ((4 - len(imagestr) % 4) % 4)
                return self.save_tmp_image_at_backend(imagestr, user)

    def post(self, request):
        try:
            imagestr = request.data['image']
            user = request.user
            ic.enable()
            url = self.save_tmp_image_at_backend(imagestr, user)
            img = cv2.imread(ic(url))
            cropx = int(float(str(request.data['cropx'])))
            cropy = int(float(str(request.data['cropy'])))
            height = int(float(str(request.data['height'])))
            width = int(float(str(request.data['width'])))

            cropx = 0 if cropx < 0 else cropx
            cropy = 0 if cropy < 0 else cropy

            crop_img = img[cropy: cropy + height, cropx: cropx+width]
            cv2.imwrite(url, crop_img)

            custom_user = user.customuser_set.all()[0]
            custom_user.image.delete()

            custom_user.image.save(
                str(user.username)+'.png', files.File(open(url, 'rb')))
            custom_user.save()

            os.remove(url)
            return Response({'url': custom_user.image.url}, HTTP_200_OK)
        except:
            traceback.print_exc()
            return Response({'message': "something wrong"}, HTTP_500_INTERNAL_SERVER_ERROR)
