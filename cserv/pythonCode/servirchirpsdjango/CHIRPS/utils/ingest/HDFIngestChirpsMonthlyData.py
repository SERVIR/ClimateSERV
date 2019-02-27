'''
Created on May 2016

@author: Kris Stanton

Some Portions of this code were taking from 
@author: jeburks
'''

import sys
import datetime
import time
import calendar
import os
import json
import CHIRPS.utils.configuration.parameters as params
import CHIRPS.utils.file.h5datastorage as dataS
import CHIRPS.utils.geo.geotiff.geotifftools as georead
import CHIRPS.utils.db.bddbprocessing as bdp

# Support for incrementing by months 
def add_months(sourceDateTime,months):
    month = sourceDateTime.month - 1 + months
    year = int(sourceDateTime.year + month / 12 )
    month = month % 12 + 1
    day = min(sourceDateTime.day,calendar.monthrange(year,month)[1])
    #return datetime.date(year,month,day)
    return datetime.datetime(year,month,day)

# Ingest the date range
# Currently, limited to ranges that have the same year value. (Solution for now is to call this function multiple times)
def ingest_CHIRPSMonthly(startYYYYMM, endYYYYMM):
    # Set the Datatype number
    current_DataTypeNumber = 28  # Hardcoded until there is a better way to get this information (maybe params DB?)

    # Data Classes?
    
    # Convert to dates
    dateFormat = "%Y%m"
    start_Date = datetime.datetime.strptime(startYYYYMM, dateFormat)
    end_Date = datetime.datetime.strptime(endYYYYMM, dateFormat)
    
    # Build expected string list
    dataset_Obj_List = []
    
    end_Date = add_months(end_Date, 1) # this is to fix that hacky while loop found below
    tempDate = start_Date
    while((end_Date - tempDate).days > 0):
        # Date to be used inside the while loop
        currentDate = tempDate
        
        # From the FTP downloader for Chirps Monthly
        #theCurrentPath = ftp_FolderPath + "chirps-v2.0." + str(currentDate.year) + "." + str("%02d" % currentDate.month) + ".tif.gz"
        #expected_FTP_FilePaths.append(theCurrentPath)
        #print("-Expected Path: " + str(theCurrentPath))
        
        # Get the expected filename  # something like this should be part of a dataclasses object
        tifFileName = "chirps-v2.0." + str(currentDate.year) + "." + str("%02d" % currentDate.month) + ".tif" 
        
        # append the object
        obj_To_Append = {
               "Tif_File_Name":tifFileName,
               "year":currentDate.year,
               "month":currentDate.month,
               "day":currentDate.day
               }
        dataset_Obj_List.append(obj_To_Append)
        
        # Increment and set new temp value for while loop
        currentDate = add_months(tempDate,1)
        tempDate = currentDate
    
    # Folder where TIF files end up after download.
    input_Dataset_Folder = params.dataTypes[current_DataTypeNumber]['inputDataLocation']
    
    # Other vars needed for the loop
    itemsCounter = 0
    ingest_Error_List = []
    capabilities_DateFormatString = "%Y_%m"
    last_YYYY_MM_DD_Processed = None
    
    # Ingest specific stuff
    yearForHDF = int(startYYYYMM[0:4])  # Year for HDF File
    dataStore = dataS.datastorage(current_DataTypeNumber, yearForHDF, forWriting=True)
    indexer = params.dataTypes[current_DataTypeNumber]['indexer']
    
    # Do the actual ingest.
    for currentObj in dataset_Obj_List:
        
        try:
            # Try to ingest the file, record error if there is an error
            
            # open the file
            fileName = currentObj['Tif_File_Name']
            fileToProcess = os.path.join(input_Dataset_Folder,fileName)
            
            print("-Processing File: " + str(fileToProcess))

            
            theYear = yearForHDF #currentObj['year']
            theMonth = currentObj['month']
            theDay = 1 #currentObj['day'] # Monthly datasets use the first day of each month.
            
            # Open / Read the file
            ds = georead.openGeoTiff(fileToProcess)
            #ds = georead.openGeoTiff_WithUpdateFlag(fileToProcess)
            time.sleep(t)
            # If the dataset format does not come with a correct projection and transform, this is where to override them.
            # Set a new projection (since the IMERG data does not come with one already..)
            #ds.SetProjection(IMERG_DataClass.get_DefaultProjection_String())
            #ds.SetGeoTransform(IMERG_DataClass.get_DefaultGeoTransform_Obj())
            
            # Get the values to save (just like in all the other ingest procedures.
            prj = ds.GetProjection()
            grid = ds.GetGeoTransform()
                
            # Index it.
            img =  georead.readBandFromFile(ds, 1)
            ds = None
            #index = indexer.getIndexBasedOnDate()
            index = indexer.getIndexBasedOnDate(theDay, theMonth, theYear)
            #print "Index:",index
            dataStore.putData(index, img)
            #last_YYYY_MM_DD_Processed = str(theYear)+ "_" + str("%02d" % theMonth) + "_" + str("%02d" % theDay)
            last_YYYY_MM_Processed = str(theYear)+ "_" + str("%02d" % theMonth) # + "_" + str("%02d" % theDay)
            itemsCounter += 1
            
            
            
        except:
            # do something in the event of an error
            e = sys.exc_info()[0]
            errorStr = "-ERROR Ingesting File: " + str(fileName) + " System Error Message: " + str(e)
            print(str(errorStr))
            ingest_Error_List.append(errorStr)
        
    # Close and save the data
    dataStore.close()
    
    if(itemsCounter > 0):
        dataS.writeSpatialInformation(params.dataTypes[current_DataTypeNumber]['directory'],prj,grid,yearForHDF)

        #print("Debug: processedFileNames: " + str(processedFileNames))
        #print("Debug: skippedFileNames: " + str(skippedFileNames))
        print("Finished processing, " + str(itemsCounter) + ", data items for year: " + str(yearForHDF))
    
        # need the projection and grid strings for the capabilities output.
        #retObject = {"projection":prj,"grid":grid}
    
        #return retObject
    
        # Update the capabilities
        try:
            print("-TODO, Check existing capabilities and overwrite only some parts rather than just overwriting with the last option... this was a shortcut taken to meet an expectation, budget about a day or so to fix this... right now, the last item ingested has it's date set as the 'END Date' for the capabilities range, (so if we are doing a simple reingest for a small subset in the middle of the data somewhere, this bug will show up..)")
            
            
            capabilities_Info = {
                         "name":params.dataTypes[current_DataTypeNumber]['name'],
                         "description":params.dataTypes[current_DataTypeNumber]['description'],
                         "size":params.dataTypes[current_DataTypeNumber]['size'],
                         "fillValue":params.dataTypes[current_DataTypeNumber]['fillValue'],
                         "data_category":params.dataTypes[current_DataTypeNumber]['data_category'],
                         "projection":prj,
                         "grid":grid,
                         
                        # Get the start and end Date range.
                         "startDateTime":"1985_01",
                         "endDateTime":last_YYYY_MM_Processed,
                         "date_FormatString_For_ForecastRange":capabilities_DateFormatString
                         
                        # Other items to save?
                         
                         }
    
            # Write the capabilities info to the bddb
            theJSONString = json.dumps(capabilities_Info)
            # Create a connection to the DB, set the new values, close the connection
            conn = bdp.BDDbConnector_Capabilities()
            conn.set_DataType_Capabilities_JSON(current_DataTypeNumber, theJSONString)
            conn.close()
            
            print("-API Datatype Capabilities for datatype number: " +str(current_DataTypeNumber) + " written to local DB as: " + str(theJSONString))
            
        except:
            print("-WARNING: Data was ingested on this run AND there was an issue updating the API Capabilities local DB")
    
    else:
        print("No Items found for year: " + str(yearForHDF))
        print(str(len(ingest_Error_List)) + " errors associated with ingest items.")
        
    print("")
    print("Output of per-item Error Log: " + str(ingest_Error_List))
    print("")


# Now Handles multiple year range (Calls the above function multiple times)
def check_And_BreakYearsApart(startYYYYMM, endYYYYMM):
    # Validate Years,
    startYear = startYYYYMM[0:4]
    endYear = endYYYYMM[0:4]
    if (startYear != endYear):
        #print("-WARNING: Due to an Ingest range capabilitiy which requires the range to be contained to a single year, the end Date parameter has been adjusted to the last day of the year for the start year.  To continue ingesting, call the Ingest function again using the first day of the next year as your start year.")
        #print("Range Spans accross multiple years... do something about this!")
        print("Range Spans across multiple years, some processes happen on the yearly basis")
        numOfYears = int(endYear) - int(startYear)
        #for i in range(numOfYears):
        for i in range(numOfYears + 1):
            current_Year = int(startYear) + i
            current_StartMonth = "01"
            current_EndMonth = "12"
            if i == 0:
                #print "first time through the loop"
                current_StartMonth = startYYYYMM[4:6]
            #if i == (numOfYears-1):
            if i == (numOfYears):
                #print "last time through the loop"
                current_EndMonth = endYYYYMM[4:6]
            current_StartYYYYMM = str("%04d" % current_Year) + current_StartMonth
            current_EndYYYYMM = str("%04d" % current_Year) + current_EndMonth
            print("Calling ingest_CHIRPSMonthly with params: current_StartYYYYMM, current_EndYYYYMM: " + str(current_StartYYYYMM) + " and " + str(current_EndYYYYMM))
            ingest_CHIRPSMonthly(current_StartYYYYMM, current_EndYYYYMM)
    else:
        # Range within a single year
        ingest_CHIRPSMonthly(startYYYYMM, endYYYYMM)
    
    
    
# Expected input:
# - startDate (YYYYMM)
# - endDate (YYYYMM)
if __name__ == '__main__':
    print "Starting Ingest CHIRPS Monthly Data"
    args = len(sys.argv)
    if (args < 3):
        print "Usage: StartDate(YYYYMM) EndDate(YYYYMM)"
        sys.exit()
    else :
        # Time Metric tracking
        startDateTime = datetime.datetime.utcnow()
        
        print "CHIRPS Monthly Procedures: Working on Date Range: ", sys.argv[1], " - ", sys.argv[2]
        #ingest_IMERG(sys.argv[1], sys.argv[2])
        # This line below actually runs the ingest, but based on the range of years, either makes a single call or multiple calls to the ingest controller routine.
        check_And_BreakYearsApart(sys.argv[1], sys.argv[2])
        
        # output time elapsed and number of datatypes processed
        endDateTime = datetime.datetime.utcnow()
        elapsedTimedelta = endDateTime - startDateTime
        elapsedSeconds = elapsedTimedelta.total_seconds()
        
        # Final Output
        print("IMERG_Ingest Procedures: Done  -  Total Seconds elapsed: " + str(elapsedSeconds))


#import CHIRPS.utils.file.dateutils as dateutils
#import os.path
#import CHIRPS.utils.geo.geotiff.geotifftools as georead
#import CHIRPS.utils.configuration.parameters as params
#import sys
#import CHIRPS.utils.file.h5datastorage as dataS


#def processYearByDirectory(dataType,year, inputdir):
#    '''
#    
#    :param dataType:
#    :param year:
#    :param inputdir:
#    '''
#    ###Process the incoming data
#   
#    dataStore = dataS.datastorage(dataType, year, forWriting=True)
#    indexer = params.dataTypes[dataType]['indexer']
#    for filename in os.listdir(inputdir):
#        if filename.endswith(".tif"):
#            
#            fileToProcess = inputdir+"/"+filename
#            print "Processing "+fileToProcess
#            directory, fileonly = os.path.split(fileToProcess)
#        
#            dictionary = dateutils.breakApartChripsName(fileonly)
#            year = dictionary['year']
#            month = dictionary['month']
#            day = dictionary['day']
#            ds = georead.openGeoTiff(fileToProcess)
#            prj=ds.GetProjection()
#            grid = ds.GetGeoTransform()
#
#            img =  georead.readBandFromFile(ds, 1)
#            ds = None
#            index = indexer.getIndexBasedOnDate(day,month,year)
#            print "Index:",index
#            dataStore.putData(index, img)
#            
#    dataStore.close()
#    dataS.writeSpatialInformation(params.dataTypes[dataType]['directory'],prj,grid,year)
#    
#
#if __name__ == '__main__':
#    print "Starting Ingesting CHIRPS Data"
#    args = len(sys.argv)
#    if (args < 3):
#        print "Usage : Startyear endyear"
#        sys.exit()
#    else :
#        print "Working on years ",sys.argv[1],"-",sys.argv[2]
#        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
#        for year in years:
#            print "-------------------------------------------------------------Processing ",year,"-----------------------------------------------------"
#            processYearByDirectory(0,year,params.dataTypes[0]['inputDataLocation']+str(year))
#            print "-------------------------------------------------------------Done Processing ",year,"-----------------------------------------------------"
