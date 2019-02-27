'''
Created on Mar 4, 2015

@author: jeburks, 

Modified by Kris Stanton on 9/14/2015

'''
import CHIRPS.utils.file.dateutils as dateutils
import os.path
import CHIRPS.utils.geo.geotiff.geotifftools as georead
import CHIRPS.utils.configuration.parameters as params
import sys
import CHIRPS.utils.file.h5datastorage as dataS
import datetime
import CHIRPS.utils.db.bddbprocessing as bdp
import json



# TODO!  Add support for capabilities text file (should go in the same directory as the HDF, projection and geotransform files



# Return an object that contains the year, month, and day referenced by the filename passed in.
# Expected filename format "prcp_201509_e01_f002.tif"
def get_YearMonthDay_Obj_From_ClimateChange_FileName(theFileName):
    
    fileNameParts = theFileName.split('_') # "prcp_201509_e01_f002.tif" ---> ['prcp', '201509', 'e01', 'f002.tif']
    
    # Get the Start Year and Month
    fileName_YYYYMM_Of_ModelRun = fileNameParts[1]  # "201509" 
    
    # Get the number of forecast days (subtract 1 because we want a delta and the count starts at 1 and not 0.)
    theNumOfForecastDaysAhead = (int(fileNameParts[3].split('.')[0][1:]) - 1) # "f002.tif" ---> '002' ---> 2 ---> 1
    
    # Create a datetime using the start year and month, and set the date to the first day of the month
    model_Start_YYYYMM = datetime.datetime.strptime(fileName_YYYYMM_Of_ModelRun + "01","%Y%m%d") 
    
    # Apply delta forecast days to the above date time.  The result of that delta is the datetime that this current file name represents.
    intervalValue = theNumOfForecastDaysAhead
    intervalType = "days"
    time_DeltaArgs = {intervalType:intervalValue}
    currentFileDate = model_Start_YYYYMM + datetime.timedelta(**time_DeltaArgs)
    
    # Set the data to the return object and return it.
    theYear = currentFileDate.year
    theMonth = currentFileDate.month
    theDay = currentFileDate.day
    retObj = {
        'fileName':theFileName,
        'year':int(theYear),
        'month':int(theMonth),
        'day':int(theDay)
    }
    #print("get_YearMonthDay_Obj_From_ClimateChange_FileName: Debug: value of retObj: " + str(retObj))
    return retObj


# Returns a single datatype number from a given Ensemble and Variable.  Returns -1 if the datatype number could not be found
def get_Climate_DataType_Number_By_Ensemble_And_Variable(theDataTypes, theEnsemble, theVariable):
    for current_DataType in theDataTypes:
        try:
            if current_DataType['ensemble'] == theEnsemble:
                if current_DataType['variable'] == theVariable:
                    return current_DataType['number']
        except:
            pass
    # Could not find the datatype number
    return -1


def ingestSubProcess_Year(current_DataTypeNumber, year):
    
    itemsCounter = 0
    inputYear = str(year)
    processedFileNames = []
    skippedFileNames = []
    
    dataStore = dataS.datastorage(current_DataTypeNumber, year, forWriting=True)
    indexer = params.dataTypes[current_DataTypeNumber]['indexer']
    inputdir = params.dataTypes[current_DataTypeNumber]['inputDataLocation']
    print("inputdir: " + inputdir)
    # Iterate through each file and do the processing
    for filename in os.listdir(inputdir):
        if filename.endswith(".tif"):
            fileToProcess = os.path.join(inputdir,filename)
            
            #print("Processing "+ str(fileToProcess))
            directory, fileonly = os.path.split(fileToProcess)
        
            # Get the Year, Month and Day the file represents
            dictionary = get_YearMonthDay_Obj_From_ClimateChange_FileName(fileonly) # dateutils.breakApartChripsName(fileonly)
            
            # We only want items for the current year
            compareYear = str(dictionary['year'])
            #print("compareYear: " + compareYear)			
            if compareYear == inputYear:
                year = dictionary['year']
                month = dictionary['month']
                day = dictionary['day']
            
                # Open / Read the file
                #print("opening ds")				
                ds = georead.openGeoTiff(fileToProcess)
                #print("GetProjection")					
                prj=ds.GetProjection()
                #print("GetGeoTransform")					
                grid = ds.GetGeoTransform()
                #print("readBandFromFile")	
                # Index it.
                img =  georead.readBandFromFile(ds, 1)
                ds = None
                #print("getIndexBasedOnDate")					
                index = indexer.getIndexBasedOnDate(day,month,year)
                #print "Index:",index
                dataStore.putData(index, img)
                #print("putData")	           
                processedFileNames.append(fileonly)
                #print("processedFileNames")				
                itemsCounter += 1
            else:
                skippedFileNames.append(fileonly)
            
    
    # Close and save the data
    dataStore.close()
    print("data should be in ds now")
    if(itemsCounter > 0):
        print("trying to writeSpatialInformation")
        try:
			dataS.writeSpatialInformation(params.dataTypes[current_DataTypeNumber]['directory'],prj,grid,year)
        except Exception, e:
			print("Here's the error: " +  str(e))
        #print("Debug: processedFileNames: " + str(processedFileNames))
        #print("Debug: skippedFileNames: " + str(skippedFileNames))
        print("Finished processing, " + str(itemsCounter) + ", data items for year: " + str(year))
    
        # need the projection and grid strings for the capabilities output.
        retObject = {"projection":prj,"grid":grid}
    
        return retObject
    
    else:
        print("No Items found for year: " + str(year))
        retObject = {"projection":"","grid":""}
        return retObject
    
    
def ingestDataset(climate_Ensemble, climate_Variable, run_YYYYMM_String):
    print("climate_Ensemble: " + str(climate_Ensemble))
    print("climate_Variable: " + str(climate_Variable))
    print("run_YYYYMM_String: " + str(run_YYYYMM_String))
    
    
    
    
    # Get 'dataType' (by getting the datatypeNumber from the Ensemble and Variable)
    # Get 'inputdir' (by looking at datatypes[datatypeNumber]['inputDataLocation']
    # Remember, the code above does the chirps data for a single year and is called multiple times,
    #   The difference here is that this function needs to do the entire forecast range for a given ensemble and variable.
    
    
    # TODO... FIND OUT IF WE NEED TO ERASE THE CONTENT OF THE CURRENT HDF FILES BEFORE ADDING A NEW SCENERIO RUN..
    # NOT SURE IF THIS PROCEDURE WILL OVERWRITE EXISTING DATA WITH NEW DATA?  IF THAT IS THE CASE, THEN NO WIPING NEEDED.
    
    
    # Get the current Datatype number
    current_DataTypeNumber = get_Climate_DataType_Number_By_Ensemble_And_Variable(params.dataTypes, climate_Ensemble, climate_Variable)
    if current_DataTypeNumber == -1:
        print "Could not find datatype for climate_Ensemble: " + str(climate_Ensemble) + " and climate_Variable: " + str(climate_Variable)
        sys.exit()
    print("Current Datatype number: " + str(current_DataTypeNumber))
    
    # Process to get the datetimes
    numOfForecastDays = params.dataTypes[current_DataTypeNumber]['number_Of_ForecastDays']
    intervalString = str(numOfForecastDays) + " days" #"180 days"
    modelRun_DateFormat = "%Y%m"
    intervalValue = int(intervalString.split(" ")[0])
    intervalType = intervalString.split(" ")[1]
    time_DeltaArgs = {intervalType:intervalValue}
    future_End_DateTime = datetime.datetime.utcnow() + datetime.timedelta(**time_DeltaArgs)
    print("  Process to get the datetimes - completed")  
    # These forecasts always start in the same month and year as the time this script will run.. so use that. (input param in the future?)
    #current_Start_DateTime = datetime.datetime.utcnow()
    current_Start_DateTime = datetime.datetime.strptime(run_YYYYMM_String, modelRun_DateFormat)
    future_End_DateTime = current_Start_DateTime + datetime.timedelta(**time_DeltaArgs)
    current_Forecast_YYYY = current_Start_DateTime.strftime('%Y')  # YYYY
    #current_Forecast_YYYYMM = current_Start_DateTime.strftime('%Y%m')  # YYYYMM
    print("  setting datetimes - completed")    
    # Modeling these vars after the existing code base.
    #dataType = int(current_DataTypeNumber)
    #year = int(current_Forecast_YYYY)
    dataTypeNumber_Int =  int(current_DataTypeNumber) # 'datatype' in the existing code base and in this context refers to datatype number.. #params.dataTypes
    currentYear = int(current_Forecast_YYYY)
    print("currentYear: " + str(currentYear))
    nextYear = currentYear + 1
    print("  setting nextYear - completed")     
    # ks note: Issue with forecast models that run beyond the current year end where the 'next year' data ends up at the beginning of the current year.. 
    # Do this process for the current year and for the next year (note for forecasts run before July, the second run may not produce any out put.. thats ok!

    prjGrid_Object = None   # retObject = {"projection":prj,"grid":grid}
    prjGrid_Object = ingestSubProcess_Year(dataTypeNumber_Int, currentYear)
    print("  ingestSubProcess_Year current - completed: " + str(currentYear)    	)
    prjGrid_Object2 = ingestSubProcess_Year(dataTypeNumber_Int, nextYear)
    print("  ingestSubProcess_Year nextYear - completed: " + str(nextYear)) 	
    
    # Write meta/current run info JSON string to a text file
    # Filename should be the same everytime (data overwritten)
    # Info to write, the current run year, month, yyyymm string (all 3)
    # Ensemble number
    # Start forecast date year, month, day
    # End forecast date year, month, day
    print("Getting capability variables")   
    capabilities_DateFormatString = "%Y_%m_%d"
    capabilities_Info = {
                         "name":params.dataTypes[current_DataTypeNumber]['name'],
                         "description":params.dataTypes[current_DataTypeNumber]['description'],
                         "size":params.dataTypes[current_DataTypeNumber]['size'],
                         "fillValue":params.dataTypes[current_DataTypeNumber]['fillValue'],
                         "data_category":params.dataTypes[current_DataTypeNumber]['data_category'],
                         "ensemble":params.dataTypes[current_DataTypeNumber]['ensemble'],
                         "variable":params.dataTypes[current_DataTypeNumber]['variable'],
                         "variable_Label":params.dataTypes[current_DataTypeNumber]['variable_Label'],
                         "number_Of_ForecastDays":params.dataTypes[current_DataTypeNumber]['number_Of_ForecastDays'],
                         "projection":prjGrid_Object['projection'],
                         "grid":prjGrid_Object['grid'],
                         
                        # Get the start and end Date range.
                         "startDateTime":current_Start_DateTime.strftime(capabilities_DateFormatString),
                         "endDateTime":future_End_DateTime.strftime(capabilities_DateFormatString),
                         "date_FormatString_For_ForecastRange":capabilities_DateFormatString
                         
                        # Other items to save?
                         
                         }
    
    # Write the capabilities info to the bddb
    try:
		print "Trying to write the capabilities_Info"
                theJSONString = json.dumps(capabilities_Info)
		print("The json: " + str(theJSONString))
		# Create a connection to the DB, set the new values, close the connection
		conn = bdp.BDDbConnector_Capabilities()
		conn.set_DataType_Capabilities_JSON(current_DataTypeNumber, theJSONString)
		conn.close()
                print "Writing JSON complete"
    except Exception, e:
		print("Here's the error: " +  str(e))
    
    print("API Datatype Capabilities for datatype number: " +str(current_DataTypeNumber) + " written to local DB as: " + str(theJSONString))
    
    
    '''
    # Open/Create the datastore
    dataStore = dataS.datastorage(current_DataTypeNumber, year, forWriting=True)
    indexer = params.dataTypes[current_DataTypeNumber]['indexer']
    inputdir = params.dataTypes[current_DataTypeNumber]['inputDataLocation']
    
    # Iterate through each file and do the processing
    for filename in os.listdir(inputdir):
        if filename.endswith(".tif"):
            fileToProcess = os.path.join(inputdir,filename)
            #fileToProcess = inputdir+"/"+filename
            print("Processing "+ str(fileToProcess))
            directory, fileonly = os.path.split(fileToProcess)
        
            # Get the Year, Month and Day the file represents
            dictionary = get_YearMonthDay_Obj_From_ClimateChange_FileName(fileonly) # dateutils.breakApartChripsName(fileonly)
            year = dictionary['year']
            month = dictionary['month']
            day = dictionary['day']
            
            # Open / Read the file
            ds = georead.openGeoTiff(fileToProcess)
            prj=ds.GetProjection()
            grid = ds.GetGeoTransform()

            # Index it.
            img =  georead.readBandFromFile(ds, 1)
            ds = None
            index = indexer.getIndexBasedOnDate(day,month,year)
            print "Index:",index
            dataStore.putData(index, img)
            
    
    # Close and save the data
    dataStore.close()
    dataS.writeSpatialInformation(params.dataTypes[dataType]['directory'],prj,grid,year)
    #print("TODO!  Finish this code!!! (HDFIngestClimateChangeScenarioData.py)")
    '''
    
    

if __name__ == '__main__':
    print "Starting Ingesting Climate Change Scenario Data"
    args = len(sys.argv)
    if (args < 4):
        print "Usage: ClimateModelEnsembleName ClimateModelVariable YYYYMM (optional: '-ALL' for all climate datatypes)"
        sys.exit()
    else :
        
        # Tracking process time and number of datasets processed
        startDateTime = datetime.datetime.utcnow()
        dataSet_Counter = 0
        errorLog = []
        
        
        # Check to see if 'ALL' param was passed 
        isIngestAll = False
        try:
            if sys.argv[4] == '-ALL':
                print "optional param: '-ALL' was received." 
                isIngestAll = True
        except:
            isIngestAll = False
            
        if isIngestAll == True:
            # Get the YYYYMM String from the sys args
            the_YYYYMM_String = str(sys.argv[3])
            
            print "Starting ingest job for all climate datasets for (YYYYMM) " + str(the_YYYYMM_String) 
            
            # Get list of all climate model datatypes
            climateModel_DataTypeNumbers = params.get_DataTypeNumber_List_By_Property("data_category", "climatemodel")
            
            print "List of datatypeNumbers to process: " + str(climateModel_DataTypeNumbers)
            
            # Iterate through each datatype working on all of them.
            for current_DataTypeNumber in climateModel_DataTypeNumbers:
                current_Ensemble = str(params.dataTypes[current_DataTypeNumber]['ensemble'])
                current_Variable = str(params.dataTypes[current_DataTypeNumber]['variable'])
                
                print("========================================================================================")
                print("-Ingesting Ensemble: " + str(current_Ensemble) + ", Variable: " + str(current_Variable) )
                try:
                    ingestDataset(current_Ensemble, current_Variable, the_YYYYMM_String)
                    print "ingestData complete"
                except:
                    e = sys.exc_info()[0]
                    print "ingestDataset Failed"
                    errorStr1 = "--ERROR!! AN ERROR OCCURED WHILE INGESTING: Ensemble: " + str(current_Ensemble) + ", Variable: " + str(current_Variable) 
                    errorStr2 = "--System Error Message: " + str(e)
                    errorLog.append(errorStr1)
                    errorLog.append(errorStr2)
                    print("--ERROR!! AN ERROR OCCURED WHILE INGESTING: Ensemble: " + str(current_Ensemble) + ", Variable: " + str(current_Variable) )
                    print("--System Error Message: " + str(e))
                
                # Increment the dataset counter
                dataSet_Counter += 1
        else:
            
            print "Ingesting only Ensemble: ",sys.argv[1]," and Variable: ",sys.argv[2]," and YYYYMM: ",sys.argv[3]

            # Get the data for this particular climate model.
            ingestDataset(str(sys.argv[1]), str(sys.argv[2]), str(sys.argv[3]))
            
            dataSet_Counter += 1
            
            
        # output time elapsed and number of datatypes processed
        endDateTime = datetime.datetime.utcnow()
        
        elapsedTimedelta = endDateTime - startDateTime
        elapsedSeconds = elapsedTimedelta.total_seconds()
        
        print(str(dataSet_Counter) + " number of datasets processed.  Total Seconds elapsed: " +str(elapsedSeconds))
        print("Error Log: " + str(errorLog))
            
        
        # OLD Code
        
        # print "Ingesting data for Ensemble: ",sys.argv[1]," and Variable: ",sys.argv[2]," and YYYYMM: ",sys.argv[3]

        # # Get the data for this particular climate model.
        # ingestDataset(str(sys.argv[1]), str(sys.argv[2]), str(sys.argv[3]))
        
        
        # OLDER Code
        
        #print "Working on years ",sys.argv[1],"-",sys.argv[2]
        #years = range(int(sys.argv[1]),int(sys.argv[2])+1)
        #for year in years:
        #    print "-------------------------------------------------------------Processing ",year,"-----------------------------------------------------"
        #    #processYearByDirectory(0,year,params.dataTypes[0]['inputDataLocation']+str(year))
        #    print "-------------------------------------------------------------Done Processing ",year,"-----------------------------------------------------"
