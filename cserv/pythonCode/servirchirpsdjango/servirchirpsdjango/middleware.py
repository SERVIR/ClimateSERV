import logging 
from urlparse import urlparse
class MetricsTracking():
    def process_response(self, request, response):
        tethys_log = logging.getLogger('metrics_logger')
        username = "None"
        if hasattr(request, 'user'):
            if request.user:
                username = request.user
            else:
                username = 'Anonymous'
        request_method = request.META.get('REQUEST_METHOD')
        clientip = request.META.get('REMOTE_ADDR')
        url = request.path
        response_status =  response.status_code
	datatype = "None"
	operationtype = "None"
        if request.GET.get('datatype'):
	    datatype = request.GET['datatype'] 
	if request.GET.get('operationtype'):
	    operationtype = request.GET['operationtype']
        tethys_log.info('%s,%s,%s,%s,%s,%s,%s' % (request_method, url, username, clientip, response_status,datatype,operationtype))
        return response
