from django.urls import path
from django.views.generic.base import TemplateView
from . import views

urlpatterns = [
    # path('',views.index, name='index'),
    path('firebase-messaging-sw.js', TemplateView.as_view(
        template_name='firebase-messaging-sw.js', content_type='application/x-javascript')),
    path('register/', views.register, name='register'),
    path('login', views.login, name='login'),
    path('mailsent', views.mailsent, name='mailsent'),
    path('successful', views.successful, name='successful'),
    path('forgotpassword', views.forgotpassword, name='forgotpassword'),
    path('', views.chat, name='chat'),
    path('changepassword/<int:id>/<str:token>',
         views.changepassword, name='changepassword'),
    # path('<int:room_id>/',views.room, name='room'),

    # api
    path('api/register', views.Register.as_view()),
    path('api/login', views.Login.as_view()),
    path('api/logout', views.Logout.as_view()),
    path('api/send_link', views.Send_link.as_view()),
    path('api/changepassword', views.ChangePassword.as_view()),
    path('api/getpeople', views.Discover.as_view()),
    path('api/sendInviteLink', views.Invite.as_view()),
    path('api/createroom', views.CreateRoom.as_view()),
    path('api/getmessages', views.GetMessages.as_view()),
    path('api/saveinfo', views.SaveInfo.as_view()),
    path('api/savepass', views.SavePassword.as_view()),
    path('api/savecropedimage', views.CropImage.as_view()),
]
