# Create your views here.
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from wsgiref.util import FileWrapper
import CHIRPS.utils.configuration.parameters as params
import json
from CHIRPS.utils.processtools import uutools as uutools
from CHIRPS.utils.geo.geoutils import decodeGeoJSON
import logging
import zmq
import CHIRPS.utils.db.bddbprocessing as bdp
import CHIRPS.utils.RequestLog.requestLog as reqLog
import sys
import datetime
import os
from __builtin__ import True

# import StringIO

# Just the first iteration on some very low level security on making a request for log data.
# TODO!  Come up with a better mechanism for restricting these requests (perhaps IP range filtering AND a token?)
global_CONST_LogToken = "SomeRandomStringThatGoesHere"
#logging.basicConfig(level=logging.DEBUG,format='%(asctime)s %(name)s.%(funcName)s +%(lineno)s: %(levelname)-8s [%(process)d] %(message)s', )
logger = logging.getLogger(__name__)



def intTryParse(value):
    """Function to try to parse an int from a string.
         If the value is not convertible it returns the orignal string and False
        :param value: Value to be convertedfrom CHIRPS.utils.processtools import uutools as uutools
        :rtype: Return integer and boolean to indicate that it was or wasn't decoded properly.
    """
    try:
        return int(value), True
    except ValueError:
        return value, False


def get_client_ip(request):
    """Function extract the client's ip address from the request
        :rtype: Return client's ip address.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def readResults(uid):
    '''
    Read a results file from the filesystem based on uuid
    :param uid: unique identifier to find the correct result.
    :rtype: loaded json data from file
    '''
    filename = params.getResultsFilename(uid)
    f = open(filename, "r")
    x = json.load(f)
    f.close()
    f = None
    return x


def readProgress(uid):
    '''
    Read a progress file from the filesystem
    :param uid: unique identifier to find the correct result.
    :rtype: the progress associated with the unique id.
    '''
    conn = bdp.BDDbConnector()
    value = conn.getProgress(uid)
    conn.close()
    return value


def processCallBack(request, output, contenttype):
    '''
    Creates the HTTP response loaded with the callback to allow javascript callback. Even for 
    Non-same origin output
    :param request: Given request that formulated the intial response
    :param output: dictinoary that contains the response
    :param contenttype: output mime type
    :rtype: response wrapped in call back.
    '''

    # All requests get pumped through this function, so using it as the entry point of the logging all requests
    # Log the Request
    #dataThatWasLogged = set_LogRequest(request, get_client_ip(request))

    if request.method == 'POST':
		try:
			callback = request.POST["callback"]
			return HttpResponse(callback + "(" + output + ")", content_type=contenttype)
		except KeyError:
			return HttpResponse(output)
			
    if request.method == 'GET':
		try:
			callback = request.GET["callback"]
			return HttpResponse(callback + "(" + output + ")", content_type=contenttype)
		except KeyError:
			return HttpResponse(output)

		
	


# def read_All_Climate_Capabilities(dataTypeNumberList):
def read_DataType_Capabilities_For(dataTypeNumberList):
    '''
    Gets the capabilities from the bddb storage for a given list of DataType Numbers
    :param request: list of data type numbers
    :rtype: List of objects
    returnList : (List)
    returnList[n].dataTypeNumber : (int) Current datatype number
    returnList[n].current_Capabilities : (string) (JSON Stringified Object) Current capabilities object, intention is that they are stored as JSON strings 
    '''
    retList = []

    try:
        # Create a connection to the bddb
        conn = bdp.BDDbConnector_Capabilities()

        # try and get data
        try:
            for currentDataTypeNumber in dataTypeNumberList:
                currentValue = conn.get_Capabilities(currentDataTypeNumber)
                appendObj = {
                    "dataTypeNumber": currentDataTypeNumber,
                    "current_Capabilities": currentValue
                }
                retList.append(appendObj)
        except Exception as e:
            # Catch an error?
            # Error here indicates trouble accessing data or possibly getting an individual capabilities item
            logger.warn(
                "Error here indicates trouble accessing data or possibly getting an individual capabilities item: " + str(
                    e))
            pass

        # Close the bddb connection
        conn.close()
    except Exception as e:
        # Catch an error?
        # Error here indicates trouble connecting to the BD Database
        # If trouble connect
        logger.warn("Error here indicates trouble connecting to the BD Database: " + str(e))
        pass
    logger.warn("No error was found, look some place else")
    # return the list!
    return retList


@csrf_exempt
def getParameterTypes(request):
    '''
    Get a list of all of the parameter types. 
    :param request: in coming request, but don't need anything from the request.
    '''
    print "Getting Parameter Types"
    logger.info("Getting Parameter Types")
    #ip = get_client_ip(request)
    return processCallBack(request, json.dumps(params.parameters), "application/javascript")


@csrf_exempt
def getFeatureLayers(request):
    '''
    Get a list of shaoefile feature types supported by the system
    :param request: Given request that formulated the intial response
    :param output: dictinoary that contains the response
    :param contenttype: output mime type
    '''
    logger.info("Getting Feature Layers")
    output = []
    for value in params.shapefileName:
        output.append({'id': value['id'], 'displayName': value['displayName'], 'visible': value['visible']})
    return processCallBack(request, json.dumps(output), "application/javascript")

@csrf_exempt
def submitMonthlyRainfallAnalysisRequest(request):
    '''
    In short, this is very simillar to submitDataRequest, but it is for a new type of server job.
    The plan is to use the same machinery that submitDataRequest uses.
    [requested Submitted via ZMQ] - [Job is processed by new code, but still updates a flat DB] - [request for data still returns data but in the shape that the client side needs for this feature.]
    :param request:   layerid, featureids, geometry,
    :return:
    '''

    # COMPLETELY ISOLATED SETUP FOR MONTHLY ANALYSIS TYPES - ALL REQUESTS ARE MONTHLY ANALYSIS UNTIL I GET IT ALL FIXED AND WORKING RIGHT..
    #print("RIGHT NOW, ALL JOBS ARE: MonthlyRainfallAnalysis TYPES.  NEED TO FIX THIS WHEN I WRITE THE JAVASCRIPT/AJAX code on the client AND THE API RECEIVER CODE HERE ")

    # if(custom_job_type == "MonthlyRainfallAnalysis"):
    #     uniqueid = uutools.getUUID()
    #
    # # END, ISOLATED MONTHLY ANALYSIS CODE
    #
    #
    # # ORGINAL, EXISTING, WORKING CODE BELOW.. (pre MonthlyAnalysisFeature)

    custom_job_type = "MonthlyRainfallAnalysis"  # String used as a key in the head processor to identify this type of job.
    logger.info("Submitting Data Request for Monthly Rainfall Analysis")
    error = []

    # Seasonal Forecast Start/End Dates (Pulled in from client) (allows greater request flexibility
    # &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28
    seasonal_start_date = ""
    seasonal_end_date = ""
    if request.method == 'POST':
        try:
			seasonal_start_date = str(request.POST["seasonal_start_date"])
			seasonal_end_date = str(request.POST["seasonal_end_date"])
			# Force to only accept 10 character string // validation/sec
			seasonal_start_date = seasonal_start_date[0:10]
			seasonal_end_date = seasonal_end_date[0:10]
        except KeyError:
			logger.warn("issue with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")
			error.append("Error with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")


		# Get geometry from parameter
		# Or extract from shapefile
        geometry = None
        featureList = False
        if "layerid" in request.POST:
            try:
                layerid = str(request.POST["layerid"])
                fids = str(request.POST["featureids"]).split(',')
                featureids = []
                for fid in fids:
                    value, isInt = intTryParse(fid)
                    if (isInt == True):
                        featureids.append(value)

                featureList = True
				##Go get geometry

                logger.debug("getMonthlyRainfallAnalysis: Loaded feature ids, featureids: " + str(featureids))

            except KeyError:
                logger.warn("issue with finding geometry")
                error.append("Error with finding geometry: layerid:" + str(layerid) + " featureid: " + str(featureids))

        else:
            try:
                polygonstring = request.POST["geometry"]
                geometry = decodeGeoJSON(polygonstring);
				# create geometry
            except KeyError:
                logger.warn("Problem with geometry")
                try:
                    error.append("problem decoding geometry " + polygonstring)
                except:
					# Example Geometry param: {"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}
                    example_geometry_param = '{"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}'
                    error.append("problem decoding geometry.  Maybe missing param: 'geometry'.  Example of geometry param: " + example_geometry_param)

            if geometry is None:
                logger.warn("Problem in that the geometry is a problem")
            else:
                logger.warn(geometry)

        uniqueid = uutools.getUUID()
        logger.info("Submitting (getMonthlyRainfallAnalysis) " + uniqueid)

		# Submit requests to the ipcluster service to get data
        if (len(error) == 0):
            dictionary = {'uniqueid': uniqueid,
						  'custom_job_type': custom_job_type,
						  'seasonal_start_date': seasonal_start_date,
						  'seasonal_end_date': seasonal_end_date
						  }
            if (featureList == True):
                dictionary['layerid'] = layerid
                dictionary['featureids'] = featureids
            else:
                dictionary['geometry'] = polygonstring

			##logger.info("submitting ",dictionary)
            context = zmq.Context()
            sender = context.socket(zmq.PUSH)
            sender.connect("ipc:///tmp/servir/Q1/input")
            sender.send_string(json.dumps(dictionary))

            return processCallBack(request, json.dumps([uniqueid]), "application/json")
        else:
            return processCallBack(request, json.dumps(error), "application/json")
			
    if request.method == 'GET':
		try:
			seasonal_start_date = str(request.GET["seasonal_start_date"])
			seasonal_end_date = str(request.GET["seasonal_end_date"])
			# Force to only accept 10 character string // validation/sec
			seasonal_start_date = seasonal_start_date[0:10]
			seasonal_end_date = seasonal_end_date[0:10]
		except KeyError:
			logger.warn("issue with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")
			error.append("Error with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")


		# Get geometry from parameter
		# Or extract from shapefile
		geometry = None
		featureList = False
		if "layerid" in request.GET:
			try:
				layerid = str(request.GET["layerid"])
				fids = str(request.GET["featureids"]).split(',')
				featureids = []
				for fid in fids:
					value, isInt = intTryParse(fid)
					if (isInt == True):
						featureids.append(value)

				featureList = True
				##Go get geometry

				logger.debug("getMonthlyRainfallAnalysis: Loaded feature ids, featureids: " + str(featureids))

			except KeyError:
				logger.warn("issue with finding geometry")
				error.append("Error with finding geometry: layerid:" + str(layerid) + " featureid: " + str(featureids))

		else:
			try:
				polygonstring = request.GET["geometry"]
				geometry = decodeGeoJSON(polygonstring);
				# create geometry
			except KeyError:
				logger.warn("Problem with geometry")
				try:
					error.append("problem decoding geometry " + polygonstring)
				except:
					# Example Geometry param: {"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}
					example_geometry_param = '{"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}'
					error.append("problem decoding geometry.  Maybe missing param: 'geometry'.  Example of geometry param: " + example_geometry_param)

			if geometry is None:
				logger.warn("Problem in that the geometry is a problem")
			else:
				logger.warn(geometry)

		uniqueid = uutools.getUUID()
		logger.info("Submitting (getMonthlyRainfallAnalysis) " + uniqueid)

		# Submit requests to the ipcluster service to get data
		if (len(error) == 0):
			dictionary = {'uniqueid': uniqueid,
						  'custom_job_type': custom_job_type,
						  'seasonal_start_date': seasonal_start_date,
						  'seasonal_end_date': seasonal_end_date
						  }
			if (featureList == True):
				dictionary['layerid'] = layerid
				dictionary['featureids'] = featureids
			else:
				dictionary['geometry'] = polygonstring

			##logger.info("submitting ",dictionary)
			context = zmq.Context()
			sender = context.socket(zmq.PUSH)
			sender.connect("ipc:///tmp/servir/Q1/input")
			sender.send_string(json.dumps(dictionary))

			return processCallBack(request, json.dumps([uniqueid]), "application/json")
		else:
			return processCallBack(request, json.dumps(error), "application/json")

@csrf_exempt
def submitMonthlyGEFSRainfallAnalysisRequest(request):
    '''
    In short, this is very simillar to submitDataRequest, but it is for a new type of server job.
    The plan is to use the same machinery that submitDataRequest uses.
    [requested Submitted via ZMQ] - [Job is processed by new code, but still updates a flat DB] - [request for data still returns data but in the shape that the client side needs for this feature.]
    :param request:   layerid, featureids, geometry,
    :return:
    '''

    # COMPLETELY ISOLATED SETUP FOR MONTHLY ANALYSIS TYPES - ALL REQUESTS ARE MONTHLY ANALYSIS UNTIL I GET IT ALL FIXED AND WORKING RIGHT..
    #print("RIGHT NOW, ALL JOBS ARE: MonthlyRainfallAnalysis TYPES.  NEED TO FIX THIS WHEN I WRITE THE JAVASCRIPT/AJAX code on the client AND THE API RECEIVER CODE HERE ")

    # if(custom_job_type == "MonthlyRainfallAnalysis"):
    #     uniqueid = uutools.getUUID()
    #
    # # END, ISOLATED MONTHLY ANALYSIS CODE
    #
    #
    # # ORGINAL, EXISTING, WORKING CODE BELOW.. (pre MonthlyAnalysisFeature)

    custom_job_type = "MonthlyGEFSRainfallAnalysis"  # String used as a key in the head processor to identify this type of job.
    logger.info("Submitting Data Request for Monthly Rainfall Analysis")
    error = []

    # Seasonal Forecast Start/End Dates (Pulled in from client) (allows greater request flexibility
    # &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28
    seasonal_start_date = ""
    seasonal_end_date = ""
    if request.method == 'POST':
        try:
			seasonal_start_date = str(request.POST["seasonal_start_date"])
			seasonal_end_date = str(request.POST["seasonal_end_date"])
			# Force to only accept 10 character string // validation/sec
			seasonal_start_date = seasonal_start_date[0:10]
			seasonal_end_date = seasonal_end_date[0:10]
        except KeyError:
			logger.warn("issue with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")
			error.append("Error with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")


		# Get geometry from parameter
		# Or extract from shapefile
        geometry = None
        featureList = False
        if "layerid" in request.POST:
            try:
                layerid = str(request.POST["layerid"])
                fids = str(request.POST["featureids"]).split(',')
                featureids = []
                for fid in fids:
                    value, isInt = intTryParse(fid)
                    if (isInt == True):
                        featureids.append(value)

                featureList = True
				##Go get geometry

                logger.debug("getMonthlyRainfallAnalysis: Loaded feature ids, featureids: " + str(featureids))

            except KeyError:
                logger.warn("issue with finding geometry")
                error.append("Error with finding geometry: layerid:" + str(layerid) + " featureid: " + str(featureids))

        else:
            try:
                polygonstring = request.POST["geometry"]
                geometry = decodeGeoJSON(polygonstring);
				# create geometry
            except KeyError:
                logger.warn("Problem with geometry")
                try:
                    error.append("problem decoding geometry " + polygonstring)
                except:
					# Example Geometry param: {"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}
                    example_geometry_param = '{"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}'
                    error.append("problem decoding geometry.  Maybe missing param: 'geometry'.  Example of geometry param: " + example_geometry_param)

            if geometry is None:
                logger.warn("Problem in that the geometry is a problem")
            else:
                logger.warn(geometry)

        uniqueid = uutools.getUUID()
        logger.info("Submitting (getMonthlyRainfallAnalysis) " + uniqueid)

		# Submit requests to the ipcluster service to get data
        if (len(error) == 0):
            dictionary = {'uniqueid': uniqueid,
						  'custom_job_type': custom_job_type,
						  'seasonal_start_date': seasonal_start_date,
						  'seasonal_end_date': seasonal_end_date
						  }
            if (featureList == True):
                dictionary['layerid'] = layerid
                dictionary['featureids'] = featureids
            else:
                dictionary['geometry'] = polygonstring

			##logger.info("submitting ",dictionary)
            context = zmq.Context()
            sender = context.socket(zmq.PUSH)
            sender.connect("ipc:///tmp/servir/Q1/input")
            sender.send_string(json.dumps(dictionary))

            return processCallBack(request, json.dumps([uniqueid]), "application/json")
        else:
            return processCallBack(request, json.dumps(error), "application/json")
			
    if request.method == 'GET':
		try:
			seasonal_start_date = str(request.GET["seasonal_start_date"])
			seasonal_end_date = str(request.GET["seasonal_end_date"])
			# Force to only accept 10 character string // validation/sec
			seasonal_start_date = seasonal_start_date[0:10]
			seasonal_end_date = seasonal_end_date[0:10]
		except KeyError:
			logger.warn("issue with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")
			error.append("Error with getting start and end dates for seasonal forecast.  Expecting something like this: &seasonal_start_date=2017_05_01&seasonal_end_date=2017_10_28")


		# Get geometry from parameter
		# Or extract from shapefile
		geometry = None
		featureList = False
		if "layerid" in request.GET:
			try:
				layerid = str(request.GET["layerid"])
				fids = str(request.GET["featureids"]).split(',')
				featureids = []
				for fid in fids:
					value, isInt = intTryParse(fid)
					if (isInt == True):
						featureids.append(value)

				featureList = True
				##Go get geometry

				logger.debug("getMonthlyRainfallAnalysis: Loaded feature ids, featureids: " + str(featureids))

			except KeyError:
				logger.warn("issue with finding geometry")
				error.append("Error with finding geometry: layerid:" + str(layerid) + " featureid: " + str(featureids))

		else:
			try:
				polygonstring = request.GET["geometry"]
				geometry = decodeGeoJSON(polygonstring);
				# create geometry
			except KeyError:
				logger.warn("Problem with geometry")
				try:
					error.append("problem decoding geometry " + polygonstring)
				except:
					# Example Geometry param: {"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}
					example_geometry_param = '{"type":"Polygon","coordinates":[[[24.521484374999996,19.642587534013032],[32.25585937500001,19.311143355064658],[32.25585937500001,14.944784875088374],[23.994140624999996,15.284185114076436],[24.521484374999996,19.642587534013032]]]}'
					error.append("problem decoding geometry.  Maybe missing param: 'geometry'.  Example of geometry param: " + example_geometry_param)

			if geometry is None:
				logger.warn("Problem in that the geometry is a problem")
			else:
				logger.warn(geometry)

		uniqueid = uutools.getUUID()
		logger.info("Submitting (getMonthlyRainfallAnalysis) " + uniqueid)

		# Submit requests to the ipcluster service to get data
		if (len(error) == 0):
			dictionary = {'uniqueid': uniqueid,
						  'custom_job_type': custom_job_type,
						  'seasonal_start_date': seasonal_start_date,
						  'seasonal_end_date': seasonal_end_date
						  }
			if (featureList == True):
				dictionary['layerid'] = layerid
				dictionary['featureids'] = featureids
			else:
				dictionary['geometry'] = polygonstring

			##logger.info("submitting ",dictionary)
			context = zmq.Context()
			sender = context.socket(zmq.PUSH)
			sender.connect("ipc:///tmp/servir/Q1/input")
			sender.send_string(json.dumps(dictionary))

			return processCallBack(request, json.dumps([uniqueid]), "application/json")
		else:
			return processCallBack(request, json.dumps(error), "application/json")

			
@csrf_exempt
def submitDataRequest(request):
    '''
    Submit a data request for processing
    :param request: actual request that contains the data needed to put together the request for 
    processing
    '''
    logger.debug("Submitting Data Request")
    error = []
    polygonstring = None
    datatype = None
    begintime = None
    endtime = None
    intervaltype = None
    layerid = None

    if request.method == 'POST':
		#Get datatype
		
		try:
			logger.debug("looking at getting datatype"+str(request))
			datatype = int(request.POST["datatype"])
		except KeyError:
			logger.warn("issue with datatype"+str(request))
			error.append("Datatype not supported")
		#Get begin and end times
		try:
			begintime = request.POST["begintime"]
		except KeyError:
			logger.warn("issue with begintime"+str(request))
			error.append("Error with begintime")
		try:
			endtime = request.POST["endtime"]
		except KeyError:
			logger.warn("issue with endtime"+str(request))
			error.append("Error with endtime")
		#Get interval type
		try:
			intervaltype = int(request.POST["intervaltype"])
		except KeyError:
			logger.warn("issue with intervaltype"+str(request))
			error.append("Error with intervaltype")
		#Get geometry from parameter
		#Or extract from shapefile
		geometry = None
		featureList = False;
		if request.POST.get("layerid") is not None:
			try:
				layerid = str(request.POST["layerid"])
				fids = str(request.POST["featureids"]).split(',')
				featureids = []
				for fid in fids:
					value,isInt = intTryParse(fid)
					if (isInt == True):
						featureids.append(value)
						
				featureList = True
				##Go get geometry
				
				logger.debug("submitDataRequest: Loaded feature ids, featureids: " + str(featureids))
				
			except KeyError:
				logger.warn("issue with finding geometry")
				error.append("Error with finding geometry: layerid:"+str(layerid)+" featureid: "+str(featureids))
		
		else:
			try:
				polygonstring = request.POST["geometry"]
				geometry = decodeGeoJSON(polygonstring);
				#create geometry
			except KeyError:
				logger.warn("Problem with geometry")
				error.append("problem decoding geometry "+polygonstring) 
	   
			if geometry is None:
				logger.warn("Problem in that the geometry is a problem")
			else:
				logger.warn(geometry)
		try:
			operationtype = int(request.POST["operationtype"])
		except KeyError:
			logger.warn("issue with operationtype"+str(request))
			error.append("Error with operationtype")
			
    if request.method == 'GET':
		#Get datatype
		try:
			logger.debug("looking at getting datatype"+str(request))
			datatype = int(request.GET["datatype"])
		except KeyError:
			logger.warn("issue with datatype"+str(request))
			error.append("Datatype not supported")
		#Get begin and end times
		try:
			begintime = request.GET["begintime"]
		except KeyError:
			logger.warn("issue with begintime"+str(request))
			error.append("Error with begintime")
		try:
			endtime = request.GET["endtime"]
		except KeyError:
			logger.warn("issue with endtime"+str(request))
			error.append("Error with endtime")
		#Get interval type
		try:
			intervaltype = int(request.GET["intervaltype"])
		except KeyError:
			logger.warn("issue with intervaltype"+str(request))
			error.append("Error with intervaltype")
		#Get geometry from parameter
		#Or extract from shapefile
		geometry = None
		featureList = False;
		if "layerid" in request.GET:
			try:
				layerid = str(request.GET["layerid"])
				fids = str(request.GET["featureids"]).split(',')
				featureids = []
				for fid in fids:
					value,isInt = intTryParse(fid)
					if (isInt == True):
						featureids.append(value)
						
				featureList = True
				##Go get geometry
				
				logger.debug("submitDataRequest: Loaded feature ids, featureids: " + str(featureids))
				
			except KeyError:
				logger.warn("issue with finding geometry")
				error.append("Error with finding geometry: layerid:"+str(layerid)+" featureid: "+str(featureids))
		
		else:
			try:
				polygonstring = request.GET["geometry"]
				geometry = decodeGeoJSON(polygonstring);
				#create geometry
			except KeyError:
				logger.warn("Problem with geometry")
				error.append("problem decoding geometry ") 
	   
			if geometry is None:
				logger.warn("Problem in that the geometry is a problem")
			else:
				logger.warn(geometry)
		try:
			operationtype = int(request.GET["operationtype"])
		except KeyError:
			logger.warn("issue with operationtype"+str(request))
			error.append("Error with operationtype")
    

			
    uniqueid = uutools.getUUID()
    logger.info("Submitting "+uniqueid)
    #Submit requests to the ipcluster service to get data
    if (len(error) ==0):
        dictionary = {'uniqueid':uniqueid,
                'datatype':datatype,
                'begintime':begintime,
                'endtime':endtime,
                'intervaltype':intervaltype,
                'operationtype': operationtype
        }
        if (featureList == True):
            dictionary['layerid'] = layerid
            dictionary['featureids'] = featureids                  
                                 
        else:
            dictionary['geometry'] = polygonstring
        
        ##logger.info("submitting ",dictionary)
        context = zmq.Context()
        sender = context.socket(zmq.PUSH)
        sender.connect("ipc:///tmp/servir/Q1/input")
        sender.send_string(json.dumps(dictionary))
        
        return processCallBack(request,json.dumps([uniqueid]),"application/json")
    else:
        return processCallBack(request,json.dumps(error),"application/json")

	

@csrf_exempt
def getDataRequestProgress(request):
    '''
    Get feedback on the request as to the progress of the request. Will return the float percentage of progress
    :param request: contains the id of the request you want to look up.
    '''

    logger.debug("Getting Data Request Progress")
    # print "Request for progress on id ",requestid
    ###Check request status and then respond with the
    try:
        requestid = request.GET["id"]
        progress = readProgress(requestid)
        logger.debug("Progress =" + str(progress))
        if (progress == -1.0):
            logger.warn("Problem with getDataRequestProgress: " + str(request))
            return processCallBack(request, json.dumps([-1]), "application/json")
        else:
            return processCallBack(request, json.dumps([progress]), "application/json")
        ## return processCallBack(request,json.dumps([jsonresults['progress']]),"application/json")
    except Exception as e:
        logger.warn("Problem with getDataRequestProgress: " + str(request) + " " + str(e.errno) + " " + str(e.strerror))
        return processCallBack(request, json.dumps([-1]), "application/json")


@csrf_exempt
def getDataFromRequest(request):
    '''
    Get the actual data from the processing request.
    :param request:
    '''
    logger.debug("Getting Data from Request")

    ## Need to encode the data into json and send it.
    try:
        requestid = request.GET["id"]
        logger.debug("Getting Data from Request " + requestid)
        jsonresults = readResults(requestid)
        return processCallBack(request, json.dumps(jsonresults), "application/json")
    except Exception as e:
        logger.warn("problem getting request data for id: " + str(request))
        return processCallBack(request, "need to send id", "application/json")


@csrf_exempt
def getRequiredElements(request):
    '''
    Get the list of required elements for a given Math operation type.
    :param request: contains optype which is the operation type.
    '''
    logger.debug("Getting Required Elements")
    optype = int(request.GET["optype"])
    output = []
    ###for percentile need to return the required range
    if (optype == 5):
        output['percentile'] = "range"
        output['percentileType'] = "float"

    return processCallBack(request, json.dumps(output), "application/json")


# Function to return capabilities for a specific dataset
@csrf_exempt
def getCapabilitiesForDataset(request):
    '''
    Get the info for a specific dataset. (capabilities).
    :param request: Need dataset number
    returns an object 
    '''

    # Error Tracking 
    isError = False

    # Get datatype
    error = []
    datatype = 0
    try:
        logger.debug("getCapabilitiesForDataset: looking at getting datatype" + str(request))
        datatype = int(request.GET["datatype"])
    except KeyError:
        logger.warn("getCapabilitiesForDataset: issue with datatype" + str(request))
        error.append("Datatype not supported")
        isError = True

    logger.info("Getting Capabilities for Dataset : " + str(datatype))

    dataTypesToGet = []
    dataTypesToGet.append(datatype)

    current_DataType_Capabilities_List = read_DataType_Capabilities_For(dataTypesToGet)

    api_ReturnObject = {
        "RequestName": "getCapabilitiesForDataset",
        "Request_Param_Name": "datatype",
        "Request_Param_Value": datatype,
        "current_DataType_Capabilities_List": current_DataType_Capabilities_List,
        "isError": isError
    }

    return processCallBack(request, json.dumps(api_ReturnObject), "application/javascript")


# ks refactor 2015 // New API Hook getClimateScenarioInfo
# Note: Each individual capabilities entry is already wrapped as a JSON String
#        This means that those elements need to be individually unwrapped in client code.
#        Here is an example in JavaScript
#    // JavaScript code that sends the api return into an object called 'apiReturnData'
#    var testCapabilities_JSONString = apiReturnData.climate_DataTypeCapabilities[1].current_Capabilities
#    testCapabilities_Unwrapped = JSON.parse(testCapabilities_JSONString)
#    // At this point, 'testCapabilities_Unwrapped' should be a fully unwrapped JavaScript object. 
@csrf_exempt
def getClimateScenarioInfo(request):
    '''
    Get a list of all climate change scenario info (capabilities).
    :param request: in coming request, but don't need anything from the request.
    returns an object 
    '''

    # Error Tracking 
    isError = False

    # Get list of datatype numbers that have the category of 'ClimateModel'
    climateModel_DataTypeNumbers = params.get_DataTypeNumber_List_By_Property("data_category", "climatemodel")

    # Get all info from the Capabilities Data for each 'ClimateModel' datatype number 
    climateModel_DataType_Capabilities_List = read_DataType_Capabilities_For(climateModel_DataTypeNumbers)

    # 'data_category':'ClimateModel'
    climate_DatatypeMap = params.get_Climate_DatatypeMap()

    api_ReturnObject = {
        "RequestName": "getClimateScenarioInfo",
        "climate_DatatypeMap": climate_DatatypeMap,
        "climate_DataTypeCapabilities": climateModel_DataType_Capabilities_List,
        "isError": isError
    }

    # ip = get_client_ip(request)
    # return processCallBack(request,json.dumps(params.ClientSide_ClimateChangeScenario_Specs),"application/json")
    return processCallBack(request, json.dumps(api_ReturnObject), "application/javascript")
    # TODO!! Change the above return statement to return the proper object that the client can use to determine which options are available specifically for climate change scenario types.


# getFileForJobID
@csrf_exempt
def getFileForJobID(request):
    '''
    Get the file for the completed Job ID.  Will return a file download (if it exists)
    :param request: contains the id of the request you want to look up.
    '''

    logger.debug("Getting File to download.")

    try:
        requestid = request.GET["id"]
        progress = readProgress(requestid)

        # Validate that progress is at 100%
        if (progress == 100.0):

            doesFileExist = False

            expectedFileLocation = ""  # Full path including filename
            expectedFileName = ""  # Just the file name
            try:
                # Lets find the file
                path_To_Zip_MediumTerm_Storage = params.zipFile_MediumTermStorage_Path
                expectedFileName = requestid + ".zip"
                expectedFileLocation = os.path.join(path_To_Zip_MediumTerm_Storage, expectedFileName)
                doesFileExist = os.path.exists(expectedFileLocation)
            except:
                doesFileExist = False

            # Validate that a file actually exists where we say it is
            if (doesFileExist == True):

                # If the above validation checks out, return the file contents
                # theFile = FileWrapper(expectedFileLocation)
                # FileWrapper()
                # response = HttpResponse(wrapper, content_type='application/zip')
                # theFileWrapper = FileWrapper.File
                # Open the file
                theFileToSend = open(expectedFileLocation)
                theFileWrapper = FileWrapper(theFileToSend)
                response = HttpResponse(theFileWrapper, content_type='application/zip')
                response['Content-Disposition'] = 'attachment; filename=' + str(
                    expectedFileName)  # filename=myfile.zip'

                # Log the data
                #dataThatWasLogged = set_LogRequest(request, get_client_ip(request))

                return response

                # theFileData = "Return_ZipFile_Data_TODO"
                #
                ## TODO, Write file stream server.
                ## Log the Request (This is normally done in the processCallBack function... however we won't be using that pipe to serve the file stream.
                # dataThatWasLogged = set_LogRequest(request, get_client_ip(request))
                # return processCallBack(request,json.dumps("_PLACEHOLDER THIS SHOULD BE THE FILE AND NOT THIS MESSAGE!! _PLACEHOLDER"),"application/json")
                ##return processCallBack(request,json.dumps(theFileData),"application/json")

            else:
                # File did not exist        // "File does not exist on server. Was this jobID associated with a server job that produces output as a file?"
                return processCallBack(request, json.dumps(
                    "File does not exist on server.  There was an error generating this file during the server job"),
                                       "application/json")
        elif (progress == -1.0):
            # File is not finished being created.
            retObj = {
                "msg": "File Not found.  There was an error validating the job progress.  It is possible that this is an invalid job id.",
                "fileProgress": progress
            }
            return processCallBack(request, json.dumps(retObj), "application/json")
        else:
            # File is not finished being created.
            retObj = {
                "msg": "File still being built.",
                "fileProgress": progress
            }
            return processCallBack(request, json.dumps(retObj), "application/json")

    # except Exception as e:
    except:
        e = sys.exc_info()[0]
        logger.warn("Problem with getFileForJobID: System Error Message: " + str(
            e))  # +str(request.GET)+" "+str(e.errno)+" "+str(e.strerror))
        return processCallBack(request, json.dumps("Error Getting File"), "application/json")


# Serverside Script Access
# def scriptAccess_isValidate_Params(operationValue, datasetValue, intevalTypeValue):
def scriptAccess_isValidate_Params(request):
    # (request.GET['datatype'], request.GET['operationtype'], request.GET['intervaltype'])
    isValidated = True
    try:
        operationValue = request.GET['operationtype']
        datasetValue = request.GET['datatype']
        intevalTypeValue = request.GET['intervaltype']

        operation_Int = int(operationValue)
        dataset_Int = int(datasetValue)
        intervalType_Int = int(intevalTypeValue)

        # Rule: operationValue must be one of these ints  0,1,5,6
        if not ((operation_Int == 0) or (operation_Int == 1) or (operation_Int == 5) or (operation_Int == 6)):
            isValidated = False

        # Rule: if download operation value is submitted (6), than datatypes must be between 6 and 25 (including 6 and 25)
        if (operation_Int == 6):
            if not (6 <= dataset_Int <= 25):
                isValidated = False

        # Rule: DatasetValue must be valid (until we have the system wide capabilities setup going, we have to hardcode this list in here)
        if not ((dataset_Int == 0) or (dataset_Int == 1) or (6 <= dataset_Int <= 26)):
            isValidated = False

        # Rule: Intervaltype must be 0 (daily or (pentadal for eMODIS))
        if not (intervalType_Int == 0):
            isValidated = False

    except:
        # Something went wrong, most likely a parameter failed conversion... default to False
        isValidated = False

    return isValidated


# Token List (HardCoded for now, Move this to params very soon)
scriptAccess_Tokens = [
    {'isActive': True, 'token': '95ccb7bd40264379acb64aa229e41e19_ks', 'id': '0', 'name': 'Kris_TestToken_1',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': False, 'token': '23bd3de81db74be78325ab846d06e6bf_ks', 'id': '1', 'name': 'Kris_TestToken_2',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': True, 'token': 'ed2f3a1c82b04d0a961fba1ceedf0abc_as', 'id': '2',
     'name': 'Ashutosh_EarlyRelease_Token_1', 'contactEmail': 'ashutosh.limaye@nasa.gov'},
    {'isActive': True, 'token': 'b64e1306fa2e4ffcb1ee16c9b6155dad_as', 'id': '3',
     'name': 'Ashutosh_EarlyRelease_Token_2', 'contactEmail': 'ashutosh.limaye@nasa.gov'},
    {'isActive': True, 'token': '1dd4d855e8b64a35b65b4841dcdbaa8b_as', 'id': '7',
     'name': 'Ashutosh_EarlyRelease_Token_3', 'contactEmail': 'ashutosh.limaye@nasa.gov'},
    {'isActive': True, 'token': '9c4b7ae9ffe04e42873a808d726f7b55_as', 'id': '8',
     'name': 'Ashutosh_EarlyRelease_Token_4', 'contactEmail': 'ashutosh.limaye@nasa.gov'},
    {'isActive': True, 'token': 'f01e9e812068433cba2ecc6eadf15dba_af', 'id': '9', 'name': 'Africa_EarlyRelease_Token_1',
     'contactEmail': 'africaixmucane.florescordova@nasa.gov'},
    {'isActive': True, 'token': '15323f888b994ac49c1678c3e1e5e3a2_ic', 'id': '4', 'name': 'ICIMOD_Token_1',
     'contactEmail': 'eric.anderson@nasa.gov'},
    {'isActive': True, 'token': 'beca5860f93f476d96da764920eec546_rc', 'id': '5', 'name': 'RCMRD_Token_1',
     'contactEmail': 'africaixmucane.florescordova@nasa.gov'},
    {'isActive': True, 'token': '6daa6bbc95ff406f9eb40de3c35f565a_rc', 'id': '11', 'name': 'RCMRD_Token_2_JamesWanjohi',
     'contactEmail': 'jwanjohi@rcmrd.org'},
    {'isActive': True, 'token': '1c3f209dc5e64dcc8b7415ecce6f8355_ad', 'id': '6', 'name': 'ADPC_Token_1',
     'contactEmail': 'bill.crosson@nasa.gov'},
    {'isActive': True, 'token': '83e9be7ddbdf415b8032479f34777281_ad', 'id': '10', 'name': 'ADPC_Token_2',
     'contactEmail': 'bill.crosson@nasa.gov'},
    {'isActive': True, 'token': '9065934583cd45a1af90252761ab8d0e_pc', 'id': '12', 'name': 'Pat_Cappelaere',
     'contactEmail': 'pat@cappelaere.com'},
    {'isActive': True, 'token': '6a36175d28a74c34b5497ff218f80171_UU', 'id': '13', 'name': 'UNUSED_NAME',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': True, 'token': '6a36175d28a74c34b5497ff218f80171_UU', 'id': '14', 'name': 'UNUSED_NAME',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': True, 'token': '6a36175d28a74c34b5497ff218f80171_UU', 'id': '15', 'name': 'UNUSED_NAME',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': True, 'token': '6a36175d28a74c34b5497ff218f80171_UU', 'id': '16', 'name': 'UNUSED_NAME',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': True, 'token': '6a36175d28a74c34b5497ff218f80171_UU', 'id': '17', 'name': 'UNUSED_NAME',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': True, 'token': '6a36175d28a74c34b5497ff218f80171_UU', 'id': '18', 'name': 'UNUSED_NAME',
     'contactEmail': 'kris.stanton@nasa.gov'},
    {'isActive': True, 'token': '6a36175d28a74c34b5497ff218f80171_UU', 'id': '19', 'name': 'UNUSED_NAME',
     'contactEmail': 'kris.stanton@nasa.gov'}

]


# UUID('1b5b5f65-a96f-425f-89a9-7ae22004cd97')

# Process for generating a new one
# import uuid
# uuid.uuid4() # Should return a string which is the UUID 'UUID('f01e9e81-2068-433c-ba2e-cc6eadf15dba')

# Negative test (Testing a token that does not exist
#  http://climateserv.nsstc.nasa.gov/chirps/scriptAccess/?ks=TESTING&a=a&cmd=getDataRequestProgress&id=1a1e4cd7-e915-442b-8459-2f0e06f8b32d&t=95ccb7bd40264379acb64aa229e41e19_ksBADKEY_ks
# {"errorMsg": "Access Denied: Invalid Key", "request": "{u'ks': u'TESTING', u'a': u'a', u'cmd': u'getDataRequestProgress', u'id': u'1a1e4cd7-e915-442b-8459-2f0e06f8b32d', u't': u'95ccb7bd40264379acb64aa229e41e19_ksBADKEY_ks'}"}

# Negative test (Testing a token that has been turned off
#  http://climateserv.nsstc.nasa.gov/chirps/scriptAccess/?ks=TESTING&a=a&cmd=getDataRequestProgress&id=1a1e4cd7-e915-442b-8459-2f0e06f8b32d&t=23bd3de81db74be78325ab846d06e6bf_ks
# {"errorMsg": "Access Denied: Key ( 1 ) is not currently active.", "request": "{u'ks': u'TESTING', u'a': u'a', u'cmd': u'getDataRequestProgress', u'id': u'1a1e4cd7-e915-442b-8459-2f0e06f8b32d', u't': u'23bd3de81db74be78325ab846d06e6bf_ks'}"}

# Positive test (Testing a token that should work
#  http://climateserv.nsstc.nasa.gov/chirps/scriptAccess/?ks=TESTING&a=a&cmd=getDataRequestProgress&id=1a1e4cd7-e915-442b-8459-2f0e06f8b32d&t=95ccb7bd40264379acb64aa229e41e19_ks
# [-1]        // The -1 just means the job id can't be found.. the token actually did work and make it past authentication.


# Check submitted token against list to see if it is valid.  If it is valid, return the key ID, if not, return an error message.
def isTokenValid(token_ToCheck):
    try:
        the_ScriptAccess_Tokens = scriptAccess_Tokens  # Replace this with a datasource upon development of the db part of the token system.

        for currentToken in the_ScriptAccess_Tokens:
            currentToken_Value = currentToken['token']
            if currentToken_Value == token_ToCheck:
                # token passed in IS on the list, now only allow access if it is active
                if currentToken['isActive'] == True:
                    return True, currentToken['id']
                else:
                    errMsg = "Access Denied: Key ( " + currentToken['id'] + " ) is not currently active."
                    return False, errMsg
            else:
                # Current Token did not match, check the next one..
                pass
        # If we made it this far, the key was not in the list
        return False, "Access Denied: Invalid Key"
    except:
        e = sys.exc_info()[0]
        errorMsg = "ERROR isTokenValid: There was an error trying to check the_ScriptAccess_Tokens.  System error message: " + str(
            e)
        logger.error(errorMsg)
    return False, "Access Denied: Unspecified reason"


@csrf_exempt
def scriptAccess(request):
    '''
    Provide a single entry point for API Script access.
    Tokens are verified here.
    Future Notes: Serverside caching should be enabled for certain types of these requests
    Future Notes: Certain limitations of the spam (dos) protection should be handled slightly different here!
    '''

    try:
        errorMsg = ""
        api_Key_ID = "NOT_SET"

        # Get the API Access Key and check to see if it is in the list AND Active
        try:
            script_API_AccessKey = str(request.GET['t'])
            isKeyValid, keyCheckResponse = isTokenValid(script_API_AccessKey)
            if isKeyValid == False:
                keyCheckErrorMessage = keyCheckResponse
                errObj = {
                    "errorMsg": keyCheckErrorMessage,
                    "request": str(request.GET)}
                return processCallBack(request, json.dumps(errObj), "application/json")
            else:
                # Key is valid, continue
                api_Key_ID = keyCheckResponse
        except:
            errorMsg += "API Access Key Required"
            return processCallBack(request, json.dumps(errorMsg), "application/json")

        # Continue with Command Validation and then Params Validation here
        # Get the command, validate the params and execute it with those validated params
        script_Access_Command = str(request.GET['cmd'])
        logger.debug("scriptAccess: script_Access_Command: " + script_Access_Command)
        if script_Access_Command == "getDataFromRequest":
            return getDataFromRequest(request)
        elif script_Access_Command == "getFileForJobID":
            return getFileForJobID(request)
        elif script_Access_Command == "getDataRequestProgress":
            return getDataRequestProgress(request)
        elif script_Access_Command == "submitDataRequest":
            # Geometry Validation.. already handled in other part of the script.
            # Params validation
            isValid = scriptAccess_isValidate_Params(
                request)  # (request.GET['datatype'], request.GET['operationtype'], request.GET['intervaltype'])
            if isValid == True:
                return submitDataRequest(request)
            else:
                errorMsg += "Validation Error submitting new job.  Issue may be with params."
                return processCallBack(request, json.dumps(errorMsg), "application/json")
        elif script_Access_Command == "getDataFromRequest":
            return getDataFromRequest(request)
        else:
            errorMsg += "Command Not found"
            return processCallBack(request, json.dumps(errorMsg), "application/json")
        # return processCallBack(request,json.dumps("PASSED KEY CHECK WITH VALID KEY... CONTINUE TODOS!, NEXT IS CHECKING THE SUPPORTED COMMANDS, AND THEN VALIDATING PARAMS"),"application/json")

    except:
        # Error message for the system
        e = sys.exc_info()[0]
        logger.warn("Problem with scriptAccess: System Error Message: " + str(e))

        # Error message for the user
        errObj = {
            "errorMsg": "scriptAccess: Error Processing Request",
            "request": str(request.GET['QUERY_STRING'])}  # "request":str(request)}

        return processCallBack(request, json.dumps(errObj), "application/json")

    pass


# Logging
# How to access the request stuff.
# logger.info("DEBUG: request: " + str(request))
# req_Data_ToLog = decode_Request_For_Logging(request, get_client_ip(request))

# Handler for getting request log data
# global_CONST_LogToken = "SomeRandomStringThatGoesHere"
# Test url string
# http://localhost:8000/getRequestLogs/?callback=success&sYear=2015&sMonth=10&sDay=01&eYear=2015&eMonth=10&eDay=04&tn=SomeRandomStringThatGoesHere
@csrf_exempt
def getRequestLogs(request):
    '''
    Get a list of all request logs within a specified date range.
    :param request: in coming request, Need to pull the following params: sYear, sMonth, sDay, eYear, eMonth, eDay, tn
    returns a list wrapped in JSON string
    '''
    theLogs = []

    try:
        # get tn (token)
        # global global_CONST_LogToken
        request_Token = request.GET["tn"]
        if (request_Token == global_CONST_LogToken):
            sYear = request.GET["sYear"]
            sMonth = request.GET["sMonth"]
            sDay = request.GET["sDay"]
            eYear = request.GET["eYear"]
            eMonth = request.GET["eMonth"]
            eDay = request.GET["eDay"]
            theLogs = get_LogRequests_ByRange(sYear, sMonth, sDay, eYear, eMonth, eDay)

    except:
        retObj = {
            "error": "Error Processing getRequestLogs (This error message has been simplified for security reasons.  Please contact the website owner for more information)"
        }
        theLogs.append(retObj)

    return processCallBack(request, json.dumps(theLogs), "application/json")


# Some rough notes on how to process the request logs on the client side
# Data comes back as an array wrapped in a callback function
# theLogs = returnData;
# theLogs[n].key // Should give a date time string  // "2015_10_04_06_22_48_590171"  // Format is (python datetime format) "%Y_%m_%d_%H_%M_%S_%f"
# theLogs[n].value // Should give a JSON wrapped object which contains various request datas.
# unwrapped_SingleLogItem = JSON.parse(singleLogItem.value) // Unwraps the content of the request log into an object.
# unwrapped_SingleLogItem.iso_DateTime // Datetime of the request, example: "2015-10-04T06:22:48Z"
# unwrapped_SingleLogItem.request_Data // Object that holds various items (most likely if changes are made to what is stored, the properties here will be what changes, so make sure any code written against this is not dependent on these props always existing! (try/catch is your friend!.. dump props functions may also be useful!)
# // At this time, here is what is stored
# unwrapped_SingleLogItem.request_Data.API_URL_Path  // Example Value: "/getRequestLogs/"
# unwrapped_SingleLogItem.request_Data.RequestParams  // The list of stuff (usually the 'data' or url params from an ajax request) that the client sent
# unwrapped_SingleLogItem.request_Data.client_ip    // Example Value: "127.0.0.1"
# unwrapped_SingleLogItem.request_Data.httpUserAgent    // (User Agent variable, the contents of this vary widely but mostly this is used to tell what browser accessed the system.)


# Stores a request to the log
# Usage Example
# dataThatWasLogged = set_LogRequest(request, get_client_ip(request))    
# logger.info("DEBUG: Request Logged (str(dataThatWasLogged)): " + str(dataThatWasLogged))
def set_LogRequest(theRequest, theIP):
    # Many params come with this
    # To add more items that should be logged, edit the function 'decode_Request_For_Logging' found in requestLog.py
    theRequestObj = None  # Scoping
    try:
        rLog = reqLog.requestLog()
        rLog.logger = logger
        theRequestObj = rLog.decode_Request_For_Logging(theRequest, theIP)
        rLog.add_New_Request(theRequestObj)
        logger.info("Request Logged!")
    except:
        e = sys.exc_info()[0]
        errorMsg = "ERROR set_LogRequest: There was an error trying to log this request.  System error message: " + str(
            e)  # + " Object Details: " + str(theRequest)
        logger.error(errorMsg)

    return theRequestObj


# get the request logs from a given date range
# Returns a list
# def get_LogRequests_ByRange(earliest_DateTime, latest_DateTime):
# Usage Example
# theLogs = get_LogRequests_ByRange("2015", "10", "01", "2015", "10", "03")
# logger.info("DEBUG: Get Request Logs result, : (str(theLogs)): " + str(theLogs))
def get_LogRequests_ByRange(sYear, sMonth, sDay, eYear, eMonth, eDay):
    # Parse start and end times into datetimes
    dateTimeFormat = "%Y_%m_%d"
    if (len(str(sMonth)) == 1):
        sMonth = "0" + str(sMonth)
    if (len(str(eMonth)) == 1):
        eMonth = "0" + str(eMonth)
    if (len(str(sDay)) == 1):
        sDay = "0" + str(sDay)
    if (len(str(eDay)) == 1):
        eDay = "0" + str(eDay)
    sDateTimeString = str(sYear) + "_" + str(sMonth) + "_" + str(sDay)
    eDateTimeString = str(eYear) + "_" + str(eMonth) + "_" + str(eDay)
    dateTime_Early = datetime.datetime.strptime(sDateTimeString, dateTimeFormat)
    dateTime_Late = datetime.datetime.strptime(eDateTimeString, dateTimeFormat)

    # Get the logs
    retLogs = []  # Scoping
    try:
        rLog = reqLog.requestLog()
        retLogs = rLog.get_RequestData_ByRange(dateTime_Early, dateTime_Late)
    except:
        e = sys.exc_info()[0]
        errorMsg = "ERROR get_LogRequests_ByRange: There was an error trying to get the logs.  System error message: " + str(
            e)
        logger.error(errorMsg)
    return retLogs
