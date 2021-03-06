'''
Created on Feb 10, 2015

@author: jeburks
'''
import bsddb
import CHIRPS.utils.configuration.parameters as params
import os
import CHIRPS.utils.locallog.locallogging as llog
import datetime
import json


def setupBSDDB():
    logger = llog.getNamedLogger("request_processor")
    logger.info("Creating db")
    bddb = BDDbConnector()
    try:
		os.chmod(params.newdbfilepath, 0777)
    except:
		pass   
    # KS Refactor 2015 - Adding a second BDDB for storing API capabilities JSON Strings // key vals are, datatypeNumber:JSONString
    #logger = llog.getNamedLogger("")
    logger.info("Creating capabilities db")
    bddb_Capabilities = BDDbConnector_Capabilities()
    try:
		os.chmod(params.capabilities_db_filepath, 0777)
    except:
		pass
    

class BDDbConnector:
    db = None
    def __init__(self):
        self.db = self.__openHash__()
        
    def __openHash__(self):
        return bsddb.hashopen(params.newdbfilepath,'c')
        
    def setProgress(self,uid,progess):
        uid = str(uid)
        ##need to deal with key does not exist
        self.db[uid] = str(progess)
       
        
    def getProgress(self,uid):
        uid = str(uid)
        if (self.db.has_key(uid)):
            value = float(self.db[uid])
            return value
        return -1
    
    def deleteProgress(self,uid):
        uid = str(uid)
        del self.db[uid] 
        
    def close(self):
        self.db.close()
        

# KS Refactor 2015 - Added a database to store capabilities for datatypes
class BDDbConnector_Capabilities:
    db = None
    def __init__(self):
        self.db = self.__openHash__()
        
    def __openHash__(self):
        return bsddb.hashopen(params.capabilities_db_filepath,'c')
    
    def set_DataType_Capabilities_JSON(self,dataTypeNumber,JSONString):
        theKey = str(dataTypeNumber)
        self.db[theKey] = JSONString
    
    def get_Capabilities(self,dataTypeNumber):
        theKey = str(dataTypeNumber)
        if (self.db.has_key(theKey)):
            value = str(self.db[theKey])
            return value
        errMsg = "No capabilities entry found for datatype " + str(theKey) + "."
        return '{"Error":"'+errMsg+'"}'
    
    def delete_Entry (self,dataTypeNumber):
        dataTypeNumber = str(dataTypeNumber)
        del self.db[dataTypeNumber] 
    
    def close(self):
        self.db.close()    
    
       
# KS Refactor 2015 - Added a database to store and retrieve request log records 
# Make a daily DB Request Log (Check the date, if the database does not exist, create it.
class BDDbConnector_RequestLog:
    '''
    In short, this class manages storage of daily logs in a set of BDDb flat files
    The way this is currently used:
        Input
            Each time a request is made (from the web facing API), the most recent database is retrieved and a new entry is made into it
            We are using the UTC time to determine when a new db is created or if an existing db is used.
            Currently, this is configured to create a new db each day (as long as there is at least one new request made on that day)
        Output
            Use 'get_JSON_RequestLogs_ForDatetimeRange' and pass in 2 datetime objects'
            Request data by sending in 2 datetime
    '''
    # TODO! : Max results per request and paging.
    # # TODO, Add this setting: max_Number_Of_Results = 100000 
    # # TODO, after adding max results setting, also add a bool return as part of the data structure which tells the API that the max number was it and report what the last entry was (so requester can pass that last entry date back in as a 'second page' request)
    
    db_Log_Interval = "days" # For now, only days are supported.. meaning each database represents 1 day of logs
    db_BaseFileName_DateFormat = "%Y_%m_%d"         # Year, Month, Day
    db_KeyStorage_Format = "%Y_%m_%d_%H_%M_%S_%f"  # Year, Month, Day, Hours, Minutes, Seconds, Microseconds
    # Maybe should use a UUID for this instead?
    db_FileName_Extension = ".db"
    db_BasePath = params.requestLog_db_basepath # ex: '/PathToRequestLogDBs/' with slashes on both ends
    #db = None
    current_DateTime = None
    db_ForWriting_NewRequests = None
    earliest_Possible_DateTime = None
    
    # Set the current DateTime and open a local DB for writing (so that the DB is locked in when an instance of this class is created) 
    def __init__(self):
        try:
			# Set the earliest possible datetime (This date is around the time this class was first created.)
			# This is an optimization that should cut down on the processing in case someone passes in a datetime search that starts at a much earlier date than this one.
			earliest_Possible_DateTime_String = "2015_09_30"
			self.earliest_Possible_DateTime = datetime.datetime.strptime(earliest_Possible_DateTime_String, self.db_BaseFileName_DateFormat)
			#datetime.datetime.strptime("2015_09_30", "%Y_%m_%d")
			
			
			# Set the current DateTime
			self.current_DateTime = self._get_CurrentDateTime()
			
			# Get the expected filename (based on the current Date Time (UTC)
			expectedFileName = self._get_DB_FileName(self.current_DateTime)
			
			# Get the DB (if it does not exist, it gets created)
			self.db_ForWriting_NewRequests = self._openHash_(expectedFileName)
			
			
			# Clean up all these old notes!!
			#self.db_BasePath = params.requestLog_db_basepath
			
			# If DB does not exist, create it.
			#  or creates (if not found) the most current DB for today.
			
			#expected_FullPath = self._get_DB_FullPath_ForFilename(expectedFileName)
			
			#self.db = self.__openHash__()
        except:
			pass
    
    # Open a given db by filename (if it does not exist, create it)
    #def __openHash__(self, theFileName):
    def _openHash_(self, theFileName):
        
        
        # Get the full path to the expected DB location
        expectedFullFilePath = self._get_DB_FullPath_ForFilename(theFileName)
        
        # Scoping
        ret_DB = None
        
        # Check if the DB exists, create it if it does not.
        isExist = self._does_DB_Exist(theFileName)
        if (isExist == False):
            # Create a new DB
            ret_DB = self._create_New_DB(expectedFullFilePath)
        else:
            ret_DB = bsddb.hashopen(expectedFullFilePath,'c')
        
        return ret_DB
    
    # Return the DB if it exists, if not, just return None
    # def __openHash__OnlyOnExist(self, theFileName):
    def _openHash_OnlyOnExist(self, theFileName):
        expectedFullFilePath = self._get_DB_FullPath_ForFilename(theFileName)
        ret_DB = None
        isExist = self._does_DB_Exist(theFileName)
        if (isExist == True):
            ret_DB = bsddb.hashopen(expectedFullFilePath,'c')
        return ret_DB
    
    # Create a new DB
    #def _create_DB_ForFileName(self, theFileName):
    def _create_New_DB(self, fullPathToNewDB):
        ret_DB = bsddb.hashopen(fullPathToNewDB,'c')
        os.chmod(fullPathToNewDB,0777)
        return ret_DB
    
    # Using only the filename, check to see if the DB exists (assumption is that all of them are stored in the same folder defined above)
    def _does_DB_Exist(self,theFileName):
        # Only checks to see if the file exists
        expectedFullFilePath = self._get_DB_FullPath_ForFilename(theFileName)
        try:
            isFile = os.path.isfile(expectedFullFilePath)
            return isFile
        except:
            return False
            
    # Get current datetime (in astandardized way, use, UTC time)
    def _get_CurrentDateTime(self):
        return datetime.datetime.utcnow()
    
    # Get Filename from a given datetime object
    def _get_DB_FileName(self,theDateTimeObj):
        baseFileName = theDateTimeObj.strftime(self.db_BaseFileName_DateFormat)
        retFileName = baseFileName + self.db_FileName_Extension
        return retFileName
    
    # Get the fullpath for a given DB filename
    def _get_DB_FullPath_ForFilename(self, theFileName):
        retPath = self.db_BasePath + theFileName
        return retPath
    
    # Get the most recent request DB
    def get_Most_Current_Request_DB(self):
        return self.db_ForWriting_NewRequests

    def close(self):
        try:
            self.db_ForWriting_NewRequests.close() 
        except:
            pass
       
    # Returns all data as list of objects, an individual object has these props,  'key':theKeyFromBDDB  and 'value':theValeFromBDDB's Matching key 
    def get_All_Data_From_DB_ForFile(self, theFileName):
        retData = []
        
        # Open the DB for reading
        theDB = self._openHash_OnlyOnExist(theFileName)
        
        # if the DB failed to open or does not exist..
        if (theDB == None):
            return retData
        else:
            # DB is open, now lets get the items.
            listOfKeys = theDB.keys();
            sortedKeys = sorted(listOfKeys)  # Only works if all the keys have the exact same length and are numbers (which should be the case here)
            
            # iterate through all the keys and get the values
            for currentKey in sortedKeys:
                currentValue = theDB[currentKey]
                addObj = {
                          'key':currentKey,
                          'value':currentValue
                          }
                retData.append(addObj)
                
            theDB.close()
            return retData
            
        
        
    # Get Request logs data for datetime range (UTC time)
    # Returns a list
    # I am wondering if this function will consume too much processing load, just to get data!!
    def get_RequestLogs_ForDatetimeRange(self, earliest_UTC_DateTime, latest_UTC_DateTime):
        
        # First, validate that the search range
        rightNow = self._get_CurrentDateTime()
        if (earliest_UTC_DateTime < self.earliest_Possible_DateTime):
            # We are searching for dates way before any of these logs existed.  
            # Set the beginning of the range to the first possible log date
            earliest_UTC_DateTime = self.earliest_Possible_DateTime
            
        if (latest_UTC_DateTime > rightNow):
            # We are searching for dates that are into the future!
            # set the end of the range to the last possible log date (Today's date)
            latest_UTC_DateTime = rightNow
            
        # Next, Create a list of strings that represent log file names (1 for each day) using the range
        
        # Interval setup stuff
        intervalString = "1 days"
        intervalValue = int(intervalString.split(" ")[0])
        intervalType = intervalString.split(" ")[1]
        time_DeltaArgs = {intervalType:intervalValue}
        
        # This step basically creates a truncated version of the start datetime which only includes years,months and days of the earliest date time passed in 
        dailyFormatString = self.db_BaseFileName_DateFormat
        tempDateTime_str = earliest_UTC_DateTime.strftime(dailyFormatString)
        reusable_Interval_DateTime = datetime.datetime.strptime(tempDateTime_str, dailyFormatString)
        
        # A place to hold all the possible log file names.
        db_FileNames_List = []
        
        # Create the list of strings by incrementing reusable_Interval_DateTime
        while (reusable_Interval_DateTime <= latest_UTC_DateTime):
            
            # Add the string to the list
            current_FileName = self._get_DB_FileName(reusable_Interval_DateTime)   #reusable_Interval_DateTime.strftime(dailyFormatString)
            
            # optimization, only add this string if a log file can be found for it. (Saves a lot of processing on the next step)
            isExist = self._does_DB_Exist(current_FileName)
            if (isExist == True):
                db_FileNames_List.append(current_FileName)
            
            # Increment the reusable datetime by 1 day
            reusable_Interval_DateTime = reusable_Interval_DateTime + datetime.timedelta(**time_DeltaArgs)
            
        # Now go through and grab all the logs.
        # Optimization, do 2 sets of compares, if the list only contains a single file, check each log entry against both datetimes in the range, if the list has 2 or more items, then the compare is done by looking at the earliest date for the first file and the latest date for the last file, if the current log file in the list is not the first or last item, don't compare anything, just grab all the logs
        # Optimization, only do compares on the first and last file in the list
        logEntriesToReturn = []
        # TODO!! Iterate through the list (in the optmized way), 'db_FileNames_List', open each db one at a time, grab all their entries and iterate through them or dump them as needed.
        
        # Only proceed if the list of files is not empty
        if(len(db_FileNames_List) > 0):
            
        
            # Simple iteration,
            firstFile_InList = db_FileNames_List[0]
            lastFile_InList = db_FileNames_List[-1]
            isOneFileOnly = False
            if (firstFile_InList == lastFile_InList):
                isOneFileOnly = True
            
            for current_DB_FileName in db_FileNames_List:
            
                try:
                    currentData = self.get_All_Data_From_DB_ForFile(current_DB_FileName)
                    # for simplicity.. for now.. just dump everything from the current data into the log entires to return
                    for currentData_Item in currentData:
                        logEntriesToReturn.append(currentData_Item)   # Doing it with only this line of code, we have props called, 'key' and 'value'.. and thats it!
                except:
                    # Possible that the file does not exist?
                    pass
                # Actually, doing the simple way is probably fastest, but we can only get search granules down to a single day (rather than hours, mins and seconds).. that is probably ok for the first version!
                # IMPORTANT OPTIMIZATION!!    START
                
                # If we only have 1 item in the list, do the double compare for each data item in the list
                
                # Else If, we are on the first item in the list, only compare entries to make sure they come after the earliest datetime
                
                # Else If, we are on the last item in the list, only compare entries to make sure they come before the latest datetime
            
                # Else, just dump everything in this data right to the return log entries.
                
                
                # STILL WORKING ON THIS PART (DO THE OPTIMIZATIONS... THEN ADD THE INPUT PIPELINE.... THEN DO SOME TEST REQUESTS!!)
                
                # IMPORTANT OPTIMIZATION!!    END
                
                
        return logEntriesToReturn
                
    # Expected format of data is string (actually expecting a JSON string, but not enforcing that)
    # Data can be anything object format however this process usually converts it to JSON string
    def add_Request(self, requestData, skip_JSON_Object_Conversion=False):
        # Get the current Date Time
        currentDateTime = self._get_CurrentDateTime()
        
        # Get the key (using time format)
        formatString = self.db_KeyStorage_Format
        theKey = currentDateTime.strftime(formatString)
        
        # convert the value into a json string or regular string 
        # NOTE (ks): I'm not sure if these DBs can handle complex non string objects.. so str()
        theValue = str(requestData)
        if(skip_JSON_Object_Conversion == True):
            theValue = str(requestData)     
        else:
            theValue = json.dumps(requestData)
        
    
        # Debug time!
        #print("currentDateTime: " + str(currentDateTime))
        #print("formatString: " + str(formatString))
        #print("theKey: " + str(theKey))
        #print("theValue: " + str(theValue))
        
        # Add new data!
        self.db_ForWriting_NewRequests[theKey] = theValue
        
    
    # Convert the list of log entries into a simple list of csv-ready strings??
    def convert_ListOfLogEntryObjects_To_CSV_StringList(self, logEntryObjects):
        return "Sorry, this method is not finished!!!"
        
    
    
    # Some old notes when building this class.... CLEAN UP!!
    # Access,
    # Get All Records between certain dates and times
    # Store Keys as datetime strings (YYYY_MM_DD_HH_MM_SS_SSS)
    # Translate a datetime range to a que of calls (to access all the correct db's)
    # Need a folder to store ALL these logs
    # Maybe purge logs after a certain number of days??
    # Need method to create a new DB if one does not already exist.
    
    
        
if __name__ == '__main__':
    setupBSDDB()        
        
    