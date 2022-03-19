from rest_framework import serializers, status
from rest_framework.response import Response
from .models import *

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'email')

    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        user.is_active = False
        user.set_password(validated_data.get('password'))
        user.save()
        
        if user:
            return user
        return Response({"message":"server error"}, status.HTTP_503_SERVICE_UNAVAILABLE)
