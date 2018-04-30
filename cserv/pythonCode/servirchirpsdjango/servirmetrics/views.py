from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse, reverse_lazy
from django.http import HttpResponse
from django.template import RequestContext
import urls
import itertools
import os
from utilities import calcMetrics
import CHIRPS.utils.configuration.parameters_ops

METRICS_LOG = '/data/data/logs/metrics.log'

def metrics(request):
    """
    Index page.
    """
    
    metrics_json = calcMetrics(METRICS_LOG)

    return render(request,'metrics.html', {'metrics_json':json.dumps(metrics_json)})

