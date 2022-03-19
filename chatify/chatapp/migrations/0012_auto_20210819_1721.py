# Generated by Django 3.2.6 on 2021-08-19 11:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatapp', '0011_alter_customuser_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='image',
            field=models.ImageField(default='Default_avatar.png', upload_to='./images'),
        ),
        migrations.AlterField(
            model_name='room',
            name='room_name',
            field=models.CharField(max_length=20, null=True),
        ),
    ]
