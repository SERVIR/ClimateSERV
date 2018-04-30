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

global_CONST_LogToken = "SomeRandomStringThatGoesHere"

logger = logging.getLogger(__name__)


#def read_All_Climate_Capabilities(dataTypeNumberList):
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
                             "dataTypeNumber":currentDataTypeNumber,
                             "current_Capabilities":currentValue
                             }
                retList.append(appendObj)
        except Exception, e:
            print('Inner error: ' + str(e))
            # Error here indicates trouble accessing data or possibly getting an individual capabilities item
            pass
        
        # Close the bddb connection
        conn.close()
    except Exception, e:
        # Catch an error?
        # Error here indicates trouble connecting to the BD Database
        # If trouble connect
        print('Outter error: ' + str(e))
        pass
    
    # return the list!
    return retList

resultList = []
resultList.append(6)
resultList.append(7)
resultList.append(8)
resultList.append(9)
resultList.append(10)
read_DataType_Capabilities_For(resultList)