from django.contrib.auth.models import User
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


class MyAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # This isn't tested, but should work
        if sociallogin.is_existing:
            return

        # some social logins don't have an email address, e.g. facebook accounts
        # with mobile numbers only, but allauth takes care of this case so just
        # ignore it
        if 'email' not in sociallogin.account.extra_data:
            return

        # check if given email address already exists.
        # Note: __iexact is used to ignore cases
        try:
            email = sociallogin.account.extra_data['email'].lower()
            email_address = User.objects.get(email__iexact=email)

        # if it does not, let allauth take care of this new social account
        except User.DoesNotExist:
            return

        # if it does, connect this new social login to the existing user
        user = email_address
        sociallogin.connect(request, user)