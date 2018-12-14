from django.conf.urls import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()
from servirchirps.views import *
urlpatterns = [
    # Examples:
    # url(r'^$', 'mytestdjango.views.home', name='home'),
    # url(r'^mytestdjango/', include('mytestdjango.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^pydash/', include('pydash.urls')),
    url(r'^metrics/', include('servirmetrics.urls')),
    url(r'^getParameterTypes/',getParameterTypes),
    url(r'^getRequiredElements/', getRequiredElements),
    #url(r'^getDataTypes/','servirchirps.views.getDataTypes'),
    url(r'^submitDataRequest/',submitDataRequest),
    url(r'^getDataRequestProgress/',getDataRequestProgress),
    url(r'^getDataFromRequest/',getDataFromRequest),
    url(r'^getFeatureLayers/',getFeatureLayers),
    url(r'^getCapabilitiesForDataset/',getCapabilitiesForDataset), 
    url(r'^getClimateScenarioInfo/',getClimateScenarioInfo),    # ks refactor 2015 // New API Hook getClimateScenarioInfo
    url(r'^getRequestLogs/',getRequestLogs),    # ks refactor 2015 // New API Hook getRequestLogs
    url(r'^getFileForJobID/',getFileForJobID),
    url(r'^submitMonthlyGEFSRainfallAnalysisRequest/',submitMonthlyGEFSRainfallAnalysisRequest),
    #url(r'^getFileURLForJobID/','servirchirps.views.getFileURLForJobID'),  # ks refactor 2015 // New API Hook for downloading files from completed jobs.
    url(r'^scriptAccess/',scriptAccess),  # New path for Serverside Script access.
    url(r'^submitMonthlyRainfallAnalysisRequest/',submitMonthlyRainfallAnalysisRequest)
]
