import json
from collections import Counter
from collections import defaultdict
import itertools
import os
import datetime
import calendar
import time
from CHIRPS.utils.configuration.parameters_ops import dataTypes

def getDataName(dataNumber):
    for item in dataTypes: 
		if (str(item['number'])) == str(dataNumber):
			return item['name']
def getPlot(cList):
    ts = []
    for val in cList:
		frequency = cList[val]
		time_stamp = calendar.timegm(datetime.datetime.strptime(val, "%Y-%m-%d").utctimetuple()) * 1000
		ts.append([time_stamp,frequency])

    return ts

def getBar(cList):
    ts = []
    for val in cList:
		series = {}
		frequency = cList[val]
		series['data'] = [frequency]
		series['name'] = val
		ts.append(series)
    return ts

def calcMetrics(MET_LOG):
    try:
		metrics_obj = open(MET_LOG,'r')
		metrics = defaultdict()
		metricsDataType = defaultdict()
		downloadsDataType = defaultdict()
		for line in metrics_obj:
			met_info = line.split(',')
			userip =  met_info[4]
			username = met_info[3]
			api_url = met_info[2].strip('/')
			req_date = met_info[0][5:].split()[0]
		datatype = met_info[6]
		operationtype = met_info[7]

		if('200' in met_info[5]):
				metrics.setdefault(api_url, []).append(req_date)
		if not "None" in datatype:
			datatypeName = getDataName(datatype)
			metricsDataType.setdefault(api_url, []).append(datatypeName)
		if "None" not in operationtype:
			if int(operationtype) == int(6):
				datatypeName = getDataName(datatype)
			downloadsDataType.setdefault(api_url, []).append(datatypeName)

		try:
			getDataPlot = sorted(getPlot(Counter(metrics['chirps/getDataFromRequest'])))
		except Exception as e:
			getDataPlot = []

		try:
			submitDataPlot = sorted(getPlot(Counter(metrics['chirps/submitDataRequest'])))
		except Exception as e:
			submitDataPlot = []

		try:
			submitDataBar = sorted(getBar(Counter(metricsDataType['chirps/submitDataRequest'])))
		except Exception as e:
			submitDataBar = []

		try:
			downloadDataPlot = sorted(getPlot(Counter(metrics['chirps/getFileForJobID'])))
		except Exception as e:
			downloadDataPlot = []

		try:
			downloadDataBar = sorted(getBar(Counter(downloadsDataType['chirps/submitDataRequest'])))
		except Exception as e:
			downloadDataBar = []

		metrics_json = {}
		metrics_json['submitDataPlot'] = submitDataPlot
		metrics_json['downloadDataPlot'] = downloadDataPlot
		metrics_json['submitDataBar'] = submitDataBar
		metrics_json['downloadDataBar'] = downloadDataBar
    except Exception as e:
		metrics_json = {}
		metrics_json['submitDataPlot'] = []
		metrics_json['downloadDataPlot'] = []
		metrics_json['submitDataBar'] = []
		metrics_json['downloadDataBar'] = []
    return metrics_json

calcMetrics('/data/data/logs/metrics1.log')
