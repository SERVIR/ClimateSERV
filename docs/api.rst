Developers API
========================

*A Developers API is provided for those who wish to incorporate the ClimateSERV data into their own separate application or script.*

API Methods
-------------------

All API methods must be called using the following pattern:

``{{ base api url }}/[MethodName]/?param1=value1&param2=value2&...paramN=valueN``

Base API URL
~~~~~~~~~~~~~~
The API allows access to the ClimateSERV processing engine and resulting data so that developers can implement their own UI or extract needed data directly from the back-end.

The base URL for all API access is:
http://climateserv.servirglobal.net/chirps/

Call-back Support
~~~~~~~~~~~~~~~~~~~~~
ALL API functions support passing in the parameter:


 	"?callback=callBackFunctionName"


The return data/object resulting from the API function call will be wrapped into a javascript function as named in the line above.  For instance, including “?callback=ProcessResults” as a parameter in the call to the API would require you to define a function “ProcessResults(returnObject)”, where “returnObject” is the object passed back as output from the API.


getParameterTypes
~~~~~~~~~~~~~~~~~~~

``https://climateserv.servirglobal.net/chirps/getParameterTypes/``

**Purpose**: Get a list of the current supported statistical operation types and their code values.

**Supported Methods**: GET

Parameters(input):
    None

Returns(output):
    Array[] // list of items. Each item is a list with 3 elements. Each item represents a currently supported statistical operation type.

Output Details:
    currentListItem = returnList[n]
    currentListItem[0]  is (int), operation type.  This is the value that the server understands as the operation type.
    currentListItem[1]  is (string), short name for operation type.
    currentListItem[2]  is (string), more readable name for operation type (used as label on dropdown part of the UI).

**Example Output**:
::

    [[0, "max", "Max"], [1, "min", "Min"], [2, "median", "Median"], [3, "range", "Range"], [4, "sum", "Sum"], [5, "avg", "Average"]]

getFeatureLayers
~~~~~~~~~~~~~~~~~~~

``http://climateserv.servirglobal.net/chirps/getFeatureLayers/``


**Purpose**: Get a list of the current feature layers included in the map for processing.

**Supported Methods**: GET

Params(input):
    None

Returns(output):
    Array[] //list of feature layer info. Each layer info includes visible, displayName, and id.

Output Details:
    currentLayer = returnList[n]
    currentLayer[‘visible’]  is (string), true or false.
    currentLayer[‘displayName’]  is (string), displayed layer name
    currentLayer[‘id’]  is (string), id of layer

**Example Output**:
::

    [{"visible": "true", "displayName": "Countries", "id": "country"}, 
    {"visible": "false", "displayName": "Admin #1", "id": "admin_1_earth"}, 
    {"visible": "false", "displayName": "Admin #2", "id": "admin_2_af"}]


getClimateScenarioInfo
~~~~~~~~~~~~~~~~~~~~~~~~

``http://climateserv.servirglobal.net/chirps/getClimateScenarioInfo/``

**Purpose**: Get information about the data structure of currently supported climate scenario datatypes.  At this time there are a total of 10 'Climate_Ensembles'.  Each 'Climate_Ensemble' can have 1, 2, or n 'Climate_Variables'.  The combination of 'Climate_Ensemble' and 'Climate_Variable' is unique and matches up to an individual dataset. (so 1 list of images per 'Climate_Ensemble' + 'Climate_Variable' combination.)

**Supported Methods**: GET

Params(input):
    None

Returns(output):
    Object{}

Output Details:
    Note on Climate Scenario Datatypes and how they relate to 'Data Type Numbers':  To integrate this new data structure with the existing system of processing and serving out datasets, these combinations have been mapped to a unique datatype number.


**Example Output**:
::

	// Return Object
	returnObject.RequestName	// (string) Static, name of the request (currently: 'getClimateScenarioInfo')
	returnObject.isError					// (bool)
	returnObject.climate_DataTypeCapabilities		// (array[])
	returnObject.climate_DatatypeMap			// (array[])
	// climate_DataTypeCapabilities
	returnObject.climate_DataTypeCapabilities[n].dataTypeNumber	// (int) The server uses the datatype to match up to a dataset using this number.
	returnObject.climate_DataTypeCapabilities[n].current_Capabilities	// (JSON encoded String) Contains various additional properties related to the dataset (such as projection, forecast days, start/end date's for forecast range, fill value, projection, grid info, etc.)

	// List of properties in the current_Capabilities JSON String
	capabilitiesItem = JSON.parse(returnObject.climate_DataTypeCapabilities[n].current_Capabilities);
	capabilitiesItem.data_category		// (string) Data Type Category (for all climate datasets this should be the same)
	capabilitiesItem.date_FormatString_For_ForecastRange	// (string) Format of the 'endDateTime' and 'startDateTime' props written as a python format string (i.e. "%Y_%m_%d")
	capabilitiesItem.description		// (string) Text description of this dataset
	capabilitiesItem.endDateTime		// (string) Last Calendar date of the the forecast range for this dataset
	capabilitiesItem.ensemble		// (string) 'Climate_Ensemble' for the current datatype
	capabilitiesItem.fillValue    		// (unsigned int) The 'no data' value of the current dataset (usually set to -9999)
	capabilitiesItem.grid			// (array[6]) 6 elements to describe geospatial raster resolution and positioning of this dataset
	capabilitiesItem.name			// (string) Shorter description of this dataset
	capabilitiesItem.number_Of_ForecastDays	// (int) Number of days in the forecast range
	capabilitiesItem.projection		// (string) GIS Projection value as a string ("GEOGCS["WGS 84",DATUM......]etc") 
	capabilitiesItem.size			// (array[2])  X,Y  ([0],[1]) pixel size of original dataset image
	capabilitiesItem.startDateTime		// (string) First calendar date of the forecast range for this dataset
	capabilitiesItem.variable			// (string) 'Climate_Variable' code
	capabilitiesItem.variable_Label		// (string) Human readable version of the 'capabilitiesItem.variable' property.


	// climate_DatatypeMap
	returnObject.climate_DatatypeMap[n].climate_Ensemble		// (string) Parent 'Climate_Ensemble'
	returnObject.climate_DatatypeMap[n].climate_DataTypes		// (array[]) List of 'Climate_Variables' and their DataTypeNumbers for the current 'Climate_Ensemble'

	// climate_DataTypes
	returnObject.climate_DatatypeMap[n].climate_DataTypes[m].climate_Ensemble	// (string) Current Climate Ensemble value (should match the parent prop)
	returnObject.climate_DatatypeMap[n].climate_DataTypes[m].climate_Ensemble_Label	// (string) Human readable version of 'returnObject.climate_DatatypeMap[n].climate_DataTypes[m].climate_Ensemble'
	returnObject.climate_DatatypeMap[n].climate_DataTypes[m].climate_Variable	// (string) Current Climate Variable
	returnObject.climate_DatatypeMap[n].climate_DataTypes[m].climate_Variable_Label	// (string) Human readable version of 'returnObject.climate_DatatypeMap[n].climate_DataTypes[m].climate_Variable'
	returnObject.climate_DatatypeMap[n].climate_DataTypes[m].dataType_Number		// (int) The value the server uses to uniquely identify the current datatype (or 'climate_ensemble' + 'climate_variable' combination)

submitDataRequest
~~~~~~~~~~~~~~~~~~~~~~~~~

``https://climateserv.servirglobal.net/chirps/submitDataRequest/``

**Purpose**: Submit a new asynchronous processing request to the server.

**Supported Methods**: GET,POST

Parameters(input):
::

	'datatype'  	// (int), the unique datatype number for the dataset which this request operates on
	'begintime' 	// (string), startDate for processing interval, format ("MM/DD/YYYY") 
	'endtime' 	// (string), endDate for processing interval, format ("MM/DD/YYYY") 
	'intervaltype' 	// (int), enumerated value that represents which type of time interval to process (daily, monthly, etc) (This enumeration is currently hardcoded in the mark up language of the current client).
	'operationtype' 	// (int), enumerated value that represents which type of statistical operation to perform on the dataset, see api call 'getParameterTypes/' for the list of currently available types.  
	// Either 'geometry' by itself or these other two params together, 'layerid' and 'featureids' are required
	'geometry'(optional)// (object), the geometry that is defined by the user on the current client 
	'layerid'(optional) // the layerid that is selected by the by the user on the current client
	'featureids'(optional) 	// the featureids as selected by the user on the current client
	'isZip_CurrentDataType'(optional) // (string), Leaving this blank converts to 'False' on the server.  Sending anything through equates to a 'True' value on the server.  This lets the server know that this is a job to zip up and return a full dataset.

Returns(output):
	string	// returns either the job ID ('uniqueid') as a UUID or an error message

Output Details:
    Submit the new datarequest and get the job ID as a response.  The returned job ID can then be used to retrieve results (see getDataFromRequest/).

**Example request**:

If you are interested in retrieving the CHIRPS data for a certain polygon and a time period period. You will make the following request:

::

	https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=04/01/2018&endtime=04/30/2018&intervaltype=0&operationtype=5&callback=successCallback&dateType_Category=default&isZip_CurrentDataType=false&geometry={"type":"Polygon","coordinates":[[[21.533203124999996,-3.1624555302378496],[21.533203124999996,-6.489983332670647],[26.279296874999986,-5.441022303717986],[26.10351562499999,-2.635788574166625],[21.533203124999996,-3.1624555302378496]]]}

**Example Output**:
::

    ["7e917e63-600d-4a1e-a069-ab8f73c9fcaf"]


getDataRequestProgress
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``https://climateserv.servirglobal.net/chirps/getDataRequestProgress/``

**Purpose**: Get the current progress the server has made on processing the given request job ID

**Supported Methods**: GET

Parameters(input):
	'id'	// (string/uuid), the unique job id (UUID format) of the job to check

Returns(output):
	float  // returns the progress value as a float between 0.0 and 100.0.  If error, a value of '-1' is returned instead

Output Details:
    Ask the server what the progress on processing the current jobID is.  Get a number back, display/update the client progress bar, wait a few seconds, make the request again.

**Example Output**:
::

	27.0

getDataFromRequest
~~~~~~~~~~~~~~~~~~~

``http://climateserv.servirglobal.net/chirps/getDataFromRequest/``

**Purpose**: Get the data from a job that has completed it's processing

**Supported Methods**: GET

Parameters(input):
	'id'		// (string/uuid), the unique job ID of the completed job

Returns (output): 	
	object{}		// Returns the data generated from the request (usually a list of numbers and dates). See below.

Output Details:		
	Ask the server for the data for a given completed Job, passing in the job ID (UUID string).

**Example Output**:
::

	retObj.data  			// (Array[]) list of data granules that the processing job output created.

	granule = retObj.data[n]		// (object), single data granule 

	granule.date 			// (string), readable date for current data granule. Format "d/m/y" not fixed length
	granule.workid			// (string), unique id for that process item (this ID is only used by the server internally.
	granule.epochTime		// (string), EpochTime (so we don't have to parse readable date strings on the client side)
	granule.value			// (object), the key in this object matches the statistical operation performed, and the value of that key is the value generated for that particular data granule.


**Example**:

For a completed job where the initial submit data request was for: User defined polygon, 'Daily' time interval, 'Max' statistical value, and for the time range Jan 1, 2015 to Jan 31, 2015


::

	{
		"data": 
		[
			{
				"date": "1/1/2015", 
				"workid": "01f4839f-7b9c-447f-b50f-0ca257c0a339", 
				"epochTime": "1420092000", 
				"value": {"max": 0.3055223822593689}
			}, 
			{	
				"date": "1/2/2015", 
				"workid": "58b6f7ea-5490-4ccd-a715-5e028407ad16", 
				"epochTime": "1420178400", 
				"value": {"max": 0.15552784502506256}
			}, 
			{
				....,
				....,
			},

			{
			"date": "1/31/2015", 
			"workid": "e021a12c-7346-4b7b-a273-bd39c7fde99b", 
			"epochTime": "1422684000", 
			"value": {"max": 4.206714630126953}
			}
		]
	}


List of Datatypes
-------------------

Regular Datasets
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

=====================================  ===================  =========================================
Dataset Name                            Datatype Number      Availability                                                 
=====================================  ===================  =========================================
Global CHIRPS                          	0                    Daily from 1981 to present
NDVI MODIS-West Africa                  1                    Every five days from 2001 to 2017
NDVI MODIS-East Africa                  2                    Every five days from 2001 to 2018
NDVI MODIS-Central Asia                 28                   Every five days from 2001 to 2017
Global ESI 4 Week                       29                   Every four weeks from 2001 to present
Global ESI 12 Week                      33                   Every twelve weeks from 2001 to present
IMGERG                                  26                   Daily from 2015 to present
CHIRS-GEFS Anomalies                    31                   Decadal from 1985 to present
CHIRS-GEFS Precip                       32                   Decadal from 1985 to present
=====================================  ===================  =========================================

Seasonal Forecast Datasets
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The seasonal forecasts are generated from a NMME model ensemble run. 

=====================================  ===================
Dataset Name                            Datatype Number                                                     
=====================================  ===================
Ensemble 1, Temperature                 6  
Ensemble 1, Precipitation               7           
Ensemble 2, Temperature                 8  
Ensemble 2, Precipitation               9 
Ensemble 3, Temperature                 10
Ensemble 3, Precipitation               11  
Ensemble 4, Temperature                 12
Ensemble 4, Precipitation               13  
Ensemble 5, Temperature                 14
Ensemble 5, Precipitation               15   
Ensemble 6, Temperature                 16
Ensemble 6, Precipitation               17   
Ensemble 7, Temperature                 18
Ensemble 7, Precipitation               19   
Ensemble 8, Temperature                 20
Ensemble 8, Precipitation               21   
Ensemble 9, Temperature                 22
Ensemble 9, Precipitation               23   
Ensemble 10, Temperature                24
Ensemble 10, Precipitation              25 
=====================================  ===================














