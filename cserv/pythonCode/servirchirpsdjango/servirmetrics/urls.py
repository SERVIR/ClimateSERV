from django.conf.urls import *
from views import *
urlpatterns = [
                       url(r'^$', metrics, name='metrics')]

