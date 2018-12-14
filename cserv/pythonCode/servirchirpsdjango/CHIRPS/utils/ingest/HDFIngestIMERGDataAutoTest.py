'''

Created on Nov 2017
@author: Billy Ashmall

'''
import sys
import datetime
import os
import json
import CHIRPS.utils.configuration.parameters as params
import CHIRPS.utils.file.h5datastorage as dataS
import CHIRPS.utils.geo.geotiff.geotifftools as georead
import CHIRPS.utils.db.bddbprocessing as bdp
import CHIRPS.dataclasses.IMERG_Data as IDC


# Currently, limited to ranges that have the same year value.
def ingest_IMERG(startYYYYMMDD, endYYYYMMDD):

    # Set the Datatype number
    current_DataTypeNumber = 34  # Hardcoded until there are more IMERG types in here..
    
    # Instance of Imerg Data Classes
    IMERG_DataClass =  IDC.IMERG_Data()
    
    # Convert to dates
    dateFormat = "%Y%m%d"
    start_Date = datetime.datetime.strptime(startYYYYMMDD, dateFormat)
    end_Date = datetime.datetime.strptime(endYYYYMMDD, dateFormat)
    
    # Build expected string list
    dataset_Obj_List = []
    #expected_Tif_FileNames = [] # 
    
    # iterate through all dates
    delta = end_Date - start_Date
    for i in range(delta.days + 1):
        #print start_Date + datetime.timedelta(days=i)
        currentDate = start_Date + datetime.timedelta(days=i)
        tifFileName = IMERG_DataClass.get_Expected_Tif_FileName(currentDate.year, currentDate.month, currentDate.day)
        #expected_Tif_FileNames.append(tifFileName)
        obj_To_Append = {
               "Tif_File_Name":tifFileName,
               "year":currentDate.year,
               "month":currentDate.month,
               "day":currentDate.day
               }
        dataset_Obj_List.append(obj_To_Append)
    
    # Get the expected file names.
    
    # Folder where TIF and TFW files end up.
    input_Dataset_Folder = params.dataTypes[current_DataTypeNumber]['inputDataLocation']

    # Other vars needed for the loop
    itemsCounter = 0
    ingest_Error_List = []
    capabilities_DateFormatString = "%Y_%m_%d"
    last_YYYY_MM_DD_Processed = None
    
    # Ingest specific stuff
    yearForHDF = int(startYYYYMMDD[0:4])  # Year for HDF File
    dataStore = dataS.datastorage(current_DataTypeNumber, yearForHDF, forWriting=True)
    indexer = params.dataTypes[current_DataTypeNumber]['indexer']
    
    # Do the actual ingest.
    #for fileName in expected_Tif_FileNames:
    for currentObj in dataset_Obj_List:
        
        try:
            # Try to ingest the file, record error if there is an error
            
            # open the file
            fileName = currentObj['Tif_File_Name']
			
            fileToProcess = os.path.join(input_Dataset_Folder,fileName)
            print(fileToProcess)
            if os.path.isfile(fileToProcess):
				print("")
            else:
				fileToProcess=fileToProcess.replace("03E","04A")
				if os.path.isfile(fileToProcess):
					print("")
				else:
					fileToProcess=fileToProcess.replace("04A","04B")            
            print("-Processing File: " + str(fileToProcess))
            
            # For some reason, we need to open TFW files instead of TIFs with GDAL..
            fileToProcess_TFW = IMERG_DataClass.convert_TIF_FileName_To_TFW_Filename(fileToProcess)

            theYear = yearForHDF #currentObj['year']
            theMonth = currentObj['month']
            theDay = currentObj['day']
            print("before geotiff")
            # Open / Read the file
            #ds = georead.openGeoTiff(fileToProcess_TFW)
            ds = georead.openGeoTiff_WithUpdateFlag(fileToProcess)
            print("after geotiff")

            # Set a new projection (since the IMERG data does not come with one already..)
            ds.SetProjection(IMERG_DataClass.get_DefaultProjection_String())
            ds.SetGeoTransform(IMERG_DataClass.get_DefaultGeoTransform_Obj())
            
            # Get the values to save (just like in all the other ingest procedures.
            prj = ds.GetProjection()
            grid = ds.GetGeoTransform()
                
            # Index it.
            img =  georead.readBandFromFile(ds, 1)
            print img
            ds = None
            index = indexer.getIndexBasedOnDate(theDay, theMonth, theYear)
            #print "Index:",index
            dataStore.putData(index, img)
            last_YYYY_MM_DD_Processed = str(theYear)+ "_" + str("%02d" % theMonth) + "_" + str("%02d" % theDay)
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
                         "startDateTime":"2015_03_08",
                         "endDateTime":last_YYYY_MM_DD_Processed,
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
    # END  ingest_IMERG


def check_And_BreakYearsApart(startYYYYMMDD, endYYYYMMDD):
    # Validate Years,
    startYear = startYYYYMMDD[0:4]
    endYear = endYYYYMMDD[0:4]
    if (startYear != endYear):
        #print("-WARNING: Due to an Ingest range capabilitiy which requires the range to be contained to a single year, the end Date parameter has been adjusted to the last day of the year for the start year.  To continue ingesting, call the Ingest function again using the first day of the next year as your start year.")
        print("Range Spans accross multiple years... do something about this!")
        ingest_IMERG(startYYYYMMDD, endYYYYMMDD)
    else:
        # Range within a single year
        ingest_IMERG(startYYYYMMDD, endYYYYMMDD)
    

# Expected input:
# - startDate (YYYYMMDD)
# - endDate (YYYYMMDD)
if __name__ == '__main__':
	print "Starting Ingest IMERG Data"

	# Time Metric tracking
	startDateTime = datetime.datetime.utcnow()

	print "IMERG_Ingest Procedures: Working on Date Range: ", sys.argv[1], " - ", sys.argv[2]
	#ingest_IMERG(sys.argv[1], sys.argv[2])
	# This line below actually runs the ingest, but based on the range of years, either makes a single call or multiple calls to the ingest controller routine.
	check_And_BreakYearsApart(sys.argv[1], sys.argv[2])

	# output time elapsed and number of datatypes processed
	endDateTime = datetime.datetime.utcnow()
	elapsedTimedelta = endDateTime - startDateTime
	elapsedSeconds = elapsedTimedelta.total_seconds()

	# Final Output
	print("IMERG_Ingest Procedures: Done  -  Total Seconds elapsed: " + str(elapsedSeconds))


