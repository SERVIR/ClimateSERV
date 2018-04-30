# Created on 9/2/2015
# Modified by Kris Stanton

# Output currently resides in chirps:/data/nmme/GEOOUT/201508/
# filenames are
# (varname)_(YYYYMM_current)_e(ENS NUMBER)_f(FORECAST_DAYS).tif
# varname = prcp or tref (for now)      # KS Note, there is no 'prcp' in the variable list, i do see 'prec' so using that instead. (See the 'parameters' files)

# More notes on folder names
# /Users/kris/work/temp_NMME_Data/server_fs/data/nmme/GEOOUT/$YYYYMM$/ens01/<AllFilesForEnsemble01Here.tif>'
# 'modelOutputLocal_BaseFolder':'/Users/kris/work/temp_NMME_Data/server_fs/data/nmme/GEOOUT/'

# Start Here
import datetime
import os
import shutil
import sys
import CHIRPS.utils.configuration.parameters as params

# Ensembles in the properties are called, 'ens01', 'ens02' etc.  In the file name, they are 'e01', 'e02'
def convert_EnsemebleProperty_To_Ensemble_ForFileName(climate_Ensemble):
    retString = "e"
    retString += climate_Ensemble[3:]
    return retString

# Returns the varname that is part of the filename from a given variable name.
# example: get_VarNameForFile_From_Name(Climate_Variable_Names, 'precipitation')
def get_VarNameForFile_From_Name(varNames, theName):
    for currentVar in varNames:
        if currentVar['Name'] == theName:
            return currentVar['VarNameForFile']
    return "VarNameNotFound"

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

def processDataset(climate_Ensemble, climate_Variable, run_YYYYMM_String):

    # Get the current Datatype number
    current_DataTypeNumber = get_Climate_DataType_Number_By_Ensemble_And_Variable(params.dataTypes, climate_Ensemble, climate_Variable)
    if current_DataTypeNumber == -1:
        print "Could not find datatype for climate_Ensemble: " + str(climate_Ensemble) + " and climate_Variable: " + str(climate_Variable)
        sys.exit()
    print("Current Datatype number: " + str(current_DataTypeNumber))
    
    numOfForecastDays = params.dataTypes[current_DataTypeNumber]['number_Of_ForecastDays']
    # TODO, Validate climate_Ensemble and climate_Variable

    # TODO, make these into configuration settings
    intervalString = str(numOfForecastDays) + " days" #"180 days"
    incrementIntervalString = "1 days"
    modelRun_DateFormat = "%Y%m"

    # Get Time Interval (parse the interval string)
    intervalValue = int(intervalString.split(" ")[0])
    intervalType = intervalString.split(" ")[1]
    time_DeltaArgs = {intervalType:intervalValue}

    # Get the args for the increment Interval
    incrementIntervalValue = int(incrementIntervalString.split(" ")[0])
    incrementIntervalType = incrementIntervalString.split(" ")[1]
    increment_DeltaArgs = {incrementIntervalType:incrementIntervalValue}

    # Get Current Date and end forecast date
    #current_Start_DateTime = datetime.datetime.utcnow()
    current_Start_DateTime = datetime.datetime.strptime(run_YYYYMM_String, modelRun_DateFormat)
    future_End_DateTime = current_Start_DateTime + datetime.timedelta(**time_DeltaArgs)
    #future_End_DateTime = datetime.datetime.utcnow() + datetime.timedelta(**time_DeltaArgs)

    
    
    print("Current calculated DateRange to download: ")
    print("From: " + str(current_Start_DateTime))
    print("To: " + str(future_End_DateTime))


    # Create a list of expected file names
    # Build the file names       // (varname)_(YYYYMM_current)_e(ENS NUMBER)_f(FORECAST_DAYS).tif
    expected_FileNames = []
    #varNameForFile = get_VarNameForFile_From_Name(params.Climate_Variable_Names, climate_Variable)
    varNameForFile = climate_Variable
    ensemeble_ForFileName = convert_EnsemebleProperty_To_Ensemble_ForFileName(climate_Ensemble) 
    current_Forecast_YYYYMM = current_Start_DateTime.strftime('%Y%m')  # YYYYMM
    # Loop through all expected date ranges to build the filenames from the dates.
    theDateTime = current_Start_DateTime
    forecastDayCounter = 1  # This may actually start at 1 and not 0, need to double check this when I get access to the server!
    while theDateTime < future_End_DateTime:


        # UPDATE: Actually, the day of year may just be forecast day.. need to double check this when I get access to the server.
        # Get the current Day of Year
        #currentDateTime_Tuple = theDateTime.timetuple()
        #dayOfYear = currentDateTime_Tuple.tm_yday
        #str_DayOfYear = str(dayOfYear)

        # Alternatively, get the forecast day
        str_DayOfYear = str(forecastDayCounter)

        # Convert to 3 digit string (so day 2 turns into 002 and day 45 turns into 045 etc)
        # Add a 10's digit
        if(len(str_DayOfYear) < 2):
            str_DayOfYear = "0"+str_DayOfYear
        # Add a 100's digit
        if(len(str_DayOfYear) < 3):
            str_DayOfYear = "0"+str_DayOfYear

        # Construct the current expected filename and add it to the list        // (varname)_(YYYYMM_current)_e(ENS NUMBER)_f(FORECAST_DAYS).tif
        currentFileName = ""
        currentFileName += varNameForFile
        currentFileName += "_"
        currentFileName += current_Forecast_YYYYMM
        currentFileName += "_"  # "_e" # The 'e' is part of the ensemble string passed in.
        currentFileName += ensemeble_ForFileName #climate_Ensemble
        currentFileName += "_f"
        currentFileName += str_DayOfYear
        currentFileName += ".tif"
        expected_FileNames.append(currentFileName)

        # Increment the datetime object by the specified increment interval (ex, 1 day)
        theDateTime = theDateTime + datetime.timedelta(**increment_DeltaArgs)

        # Increment the forecast Day Counter
        forecastDayCounter += 1

    #print("Current List of expected files: ")
    #print(str(expected_FileNames))
    
    failedFileMoves = []
    
    # Where the files are now (model output sample location)
    # 'inputDataLocation':'/Users/kris/work/temp_NMME_Data/server_fs/data/nmme/GEOOUT/varfolder/'
    # Where the files need to go example:
    # 'inputDataLocation':'/Users/kris/work/SERVIR/Data/Image/climatechange/ens01/prcp/'
    #dataSourceFolder = params.dataTypes[current_DataTypeNumber]['modelOutputLocalFolder']  #
    
    # Convert the Datasource raw folder into the proper folder that contains the exact dataset we are currently looking for. 
    # -by adding date and ensemeble info to the path.
    dataSourceFolder_Raw = params.dataTypes[current_DataTypeNumber]['modelOutputLocal_BaseFolder']
    dataSourceFolder = dataSourceFolder_Raw + run_YYYYMM_String + "/" + climate_Ensemble + "/"
    
    dataDestinationFolder = params.dataTypes[current_DataTypeNumber]['inputDataLocation']
    print("-Data Source Folder (Model Outputs) : " + str(dataSourceFolder))
    print("-Data Destination Folder (Copying To) : " + str(dataDestinationFolder))
    
    # Create the destination folder if it does not exist
    testFolderPath = os.path.dirname(dataDestinationFolder)
    if not os.path.exists(testFolderPath):
        os.makedirs(testFolderPath)
        print("-Created a new folder at path: " + str(testFolderPath))

    for currentFileName in expected_FileNames:
        srcFile_FullPath = os.path.join(dataSourceFolder, currentFileName)
        dstFile_FullPath = os.path.join(dataDestinationFolder, currentFileName)
        try:     
            #shutil.copyfile(srcFile_FullPath, dstFile_FullPath)
            print "srcFile_FullPath: " + srcFile_FullPath
            print "dstFile_FullPath: " + dstFile_FullPath
            shutil.copy2(srcFile_FullPath, dstFile_FullPath)
        except:
            failedFileMoves.append(currentFileName)
            
            # Debugging
            e = sys.exc_info()[0]
            print("--ERROR Copying file: " + str(srcFile_FullPath) + " System Error Message: " + str(e))
            
    # Report success or failed file moves.
    if len(failedFileMoves) == 0:
        print( "-" + str(forecastDayCounter) + " expected files found and moved (0 errors moving files)")
    else:
        print("--There were, " + str(len(failedFileMoves)) + " errors while moving files.")
        print("--List of files that failed to be copied to the inputs folder: ")
        for currentFailedItem in failedFileMoves:
            print("--- " + str(currentFailedItem))
            
            
    #print("Failed File Moves: " + str(failedFileMoves))
    #print("NOT FINISHED!!!  STILL NEED TO MOVE THE FILES FROM THE MODEL OUT LOCATION TO THE PLACE WHERE THE INGEST SCRIPT WILL LOOK FOR THEM.")
    # Move each file 1 by 1 from the source folder to the folder specified in the params
    # To do this, we need the following
        # Location where expected files reside on the server
            # from the email: (Verify this when I get server access) # Output currently resides in chirps:/data/nmme/GEOOUT/201508/
        # Location where to put each file
            # This should vary based on whats in the datatype param
                # (Not sure which of these it is..)
                # See, params.datatype[dtNumber][directory]             // Example: 'directory':'/data/data/image/processed/climatechange/e1/precipitation/',
                # See, params.datatype[dtNumber][inputDataLocation]     // Example: 'inputDataLocation':'/data/data/image/input/climatechange/e1/precipitation/'

    # Also, not sure about these (from the original ftpDownloader Script
    # rootftpdir ='/pub/org/chg/products/CHIRPS-2.0/global_daily/tifs/p05/'
    # rootoutputdir = params.chirpsinputdata

    # LAST TODO, Add Logging options (so if an expected file is not found, we can log it)

    # Issue with opening tif files
    # from PIL import Image
    # im = Image.open('/Users/kris/work/SERVIR/Data/Image/climatechange/ens01/prcp_201509_e01_f004.tif', 'r')
    # Error Output
    # Traceback (most recent call last):
    # File "<input>", line 1, in <module>
    # File "/opt/local/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site-packages/PIL/Image.py", line 1980, in open
    # raise IOError("cannot identify image file")
    # IOError: cannot identify image file


if __name__ == '__main__':
    print "Starting Downloading Climate Scenarios Data"
    args = len(sys.argv)
    if (args < 4):
        print "Usage: ClimateModelEnsembleName ClimateModelVariable YYYYMM (optional: '-ALL' for all climate datatypes)"
        sys.exit()
    else :
        
        # Check to see if 'ALL' param was passed 
        isProcessAll = False
        try:
            if sys.argv[4] == '-ALL':
                print "optional param: '-ALL' was received." 
                isProcessAll = True
        except:
            isProcessAll = False
            
        if isProcessAll == True:
            # Get the YYYYMM String from the sys args
            the_YYYYMM_String = str(sys.argv[3])
            
            print "Starting downloader job for all climate datasets for (YYYYMM) " + str(the_YYYYMM_String) 
            
            # Get list of all climate model datatypes
            climateModel_DataTypeNumbers = params.get_DataTypeNumber_List_By_Property("data_category", "climatemodel")
            
            print "List of datatypeNumbers to process: " + str(climateModel_DataTypeNumbers)
            
            # Iterate through each datatype working on all of them.
            for current_DataTypeNumber in climateModel_DataTypeNumbers:
                current_Ensemble = str(params.dataTypes[current_DataTypeNumber]['ensemble'])
                current_Variable = str(params.dataTypes[current_DataTypeNumber]['variable'])
                
                print("========================================================================================")
                print("-Working on Ensemble: " + str(current_Ensemble) + ", Variable: " + str(current_Variable) )
                try:
                    processDataset(current_Ensemble, current_Variable, the_YYYYMM_String)
                except:
                    e = sys.exc_info()[0]
                    print("--ERROR!! AN ERROR OCCURED WHILE WORKING ON: Ensemble: " + str(current_Ensemble) + ", Variable: " + str(current_Variable) )
                    print("--System Error Message: " + str(e))
        else:
            
            print "Working on only Ensemble: ",sys.argv[1]," and Variable: ",sys.argv[2]," and YYYYMM: ",sys.argv[3]

            # Get the data for this particular climate model.
            processDataset(str(sys.argv[1]), str(sys.argv[2]), str(sys.argv[3]))

##        #####Go get range of years
##        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
##        print years
##        for year in years:
##            createEndDirectory(year)
##            for month in range(1,13):
##                print "Processing Month:",month," Year ",year
##                processYearAndMonth(year,month)
        print "ftpClimateChangeScenarioDownloader.py has reached the end."
        print params.dataTypes[current_DataTypeNumber]['inputDataLocation']








