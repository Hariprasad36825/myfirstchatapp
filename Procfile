export DJANGO_SETTINGS_MODULE=chatify.settings
heroku config:set DJANGO_SETTINGS_MODULE=chatify.settings
release: python manage.py migrate
web: daphne chatify.asgi:application --port 6379 --bind 0.0.0.0 -v2
worker: python manage.py runworker channels --settings=chatify.settings -v2