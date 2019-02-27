# Django settings for mytestdjango project.
import socket
import os
isDev = True
#def checkDev():
#    if (socket.gethostname().startswith('chirps') == False):
#        return True
#    else :
#        return False
#isDev = checkDev() 
  
#if (isDev == True):
#    DEBUG = True
#else:
DEBUG = True
BASE_DIR = os.path.dirname(os.path.dirname(__file__))   

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

DATABASES = {
     'default': {
         'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
         'NAME': '/data/data/cserv/pythonCode/servirchirpsdjango/sqlite.db',                      # Or path to database file if using sqlite3.
#         # The following settings are not used with sqlite3:
#         'USER': '',
#         'PASSWORD': '',
#         'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
#         'PORT': '',                      # Set to empty string for default.
     }
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['*']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = '/data/data/cserv/static/'

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'pskrmc1qko7&p0s9ri20x^%ag$y9^j03#$zn7+5!pb$*zvoa**'

# List of callables that know how to import templates from various sources.
#TEMPLATE_LOADERS = (
#    'django.template.loaders.filesystem.Loader',
#    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
#)

MIDDLEWARE_CLASSES = (
    'corsheaders.middleware.CorsMiddleware', # KS Refactor 11/2015 // Cors headers for cross domain access from the GeoPortal
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'servirchirpsdjango.middleware.MetricsTracking',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware' ,
)

ROOT_URLCONF = 'servirchirpsdjango.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'servirchirpsdjango.wsgi.application'

TEMPLATES = [
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
	    'debug':False, #DEBUG 
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
       
]

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'servirchirps',
    'corsheaders',  # KS Refactor 11/2015 // Cors headers for cross domain access from the GeoPortal
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    'django.contrib.admindocs',
    'pydash',
    'servirmetrics',
]

# KS Refactor 11/2015 // Cors headers for cross domain access from the GeoPortal
CORS_ORIGIN_WHITELIST = (
        '54.172.93.198',
    )

CORS_ORIGIN_ALLOW_ALL = True
# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.

LOGGING = {
'version': 1,
'disable_existing_loggers': True,
'formatters': {
    'verbose': {
        'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
    },
    'simple': {
        'format': '%(levelname)s %(message)s'
    },
},
'filters': {
    
},
'handlers': {
#         'null': {
#             'level': 'DEBUG',
#             'class': 'django.utils.log.NullHandler',
#         },
    'console': {
        'level': 'DEBUG',
        'class': 'logging.StreamHandler',
        'formatter': 'simple'
    },
#         'mail_admins': {
#             'level': 'ERROR',
#             'class': 'django.utils.log.AdminEmailHandler'
#         },
    'console':{
               'level':'DEBUG',
               'class':'logging.StreamHandler',
               'formatter': 'simple'
    },
             
    'log_file_chirps':{
        'level': 'DEBUG',
        'class': 'logging.handlers.RotatingFileHandler',
        'filename': '/data/data/cserv/chirps.log',#'/Users/jeburks/temp/chirps.log',
        'maxBytes': '16777216', # 16megabytes
        'formatter': 'verbose'
    },
   'log_file_metrics':{
        'level': 'INFO',
        'class': 'logging.FileHandler',
        'filename': '/data/data/logs/metrics.log',#'/Users/jeburks/temp/chirps.log',
        'formatter': 'verbose'
    },
             
#         'log_file':{
#             'level': 'INFO',
#             'class': 'logging.handlers.RotatingFileHandler',
#             'filename': 'logs/django.log',
#             'maxBytes': '16777216', # 16megabytes
#             'formatter': 'verbose'
#         },
},
'loggers': {
    'servirchirps': {
        'handlers': ['log_file_chirps'],
        'level': 'INFO',
        'propagate':False,
    },
     'CHIRPS': {
        'handlers': ['log_file_chirps'],
        'level': 'INFO',
        'propagate':False,
    },
     'metrics_logger': {
        'handlers': ['log_file_metrics'],
        'level': 'INFO'
    },

#         'django': {
#             'handlers': ['log_file'],
#             'propagate': False,
#             'level': 'INFO',
#         },
#         'django.request': {
#             'handlers': ['log_file'],
#             'level': 'INFO',
#             'propagate': False,
#         }
    
},
#     'root': {
#         'handlers': ['log_file'],
#         'level': 'INFO',
#         'propagate': False,
#     },
}
