'''

Created on March 2016
@author: Kris Stanton

Last Modified on June 2017
By Githika Tondapu
'''

import sys
import datetime
import os
import urllib
import ftplib
import time
import json
import CHIRPS.utils.configuration.parameters as params
import CHIRPS.utils.db.bddbprocessing as bdp
import CHIRPS.dataclasses.IMERG_Data as IDC

# Tests 20160105 20160109
# startYYYYMMDD = "20160105"
# endYYYYMMDD = "20160109"
def download_IMERG(startYYYYMMDD, endYYYYMMDD):
    # Parse Start and End date ranges from strings
    #startYear = startYYYYMMDD[0:4]
    #startMonth = startYYYYMMDD[4:6]
    #startDay = startYYYYMMDD[6:8]
    
    #endYear = endYYYYMMDD[0:4]
    #endMonth = endYYYYMMDD[4:6]
    #endDay = endYYYYMMDD[6:8]
    
    # Set the Datatype number
    current_DataTypeNumber = 26  # Hardcoded until there are more IMERG types in here..
    
    # Instance of Imerg Data Classes
    IMERG_DataClass =  IDC.IMERG_Data()
    
    # Convert to dates
    dateFormat = "%Y%m%d"
    start_Date = datetime.datetime.strptime(startYYYYMMDD, dateFormat)
    end_Date = datetime.datetime.strptime(endYYYYMMDD, dateFormat)
    
    # Build expected string list
    #expected_FTP_FilePaths_TIF = []
    #expected_FTP_FilePaths_TFW = []
    expected_FTP_FilePaths = [] # "ftpPathTo_tif"  and "ftpPathTo_tfw
    # iterate through all dates
    delta = end_Date - start_Date
    for i in range(delta.days + 1):
        #print start_Date + datetime.timedelta(days=i)
        currentDate = start_Date + datetime.timedelta(days=i)
        print(currentDate)
        tifPath = IMERG_DataClass.get_Expected_FTP_FilePath_To_Tif(currentDate.year, currentDate.month, currentDate.day)
        tfwPath = IMERG_DataClass.get_Expected_FTP_FilePath_To_Tfw(currentDate.year, currentDate.month, currentDate.day)
        objToAdd = {
                    "ftpPathTo_tif":tifPath,
                    "ftpPathTo_tfw":tfwPath
                    }
        if len(tifPath.strip()) > 0:
			expected_FTP_FilePaths.append(objToAdd)
        #expected_FTP_FilePaths_TIF.append(tifPath)
        #expected_FTP_FilePaths_TFW.append(tfwPath)
        
    # Folder Stuff
        # Create the destination folder if it does not exist
    dataDestinationFolder = params.dataTypes[current_DataTypeNumber]['inputDataLocation']
    print("-Data Destination Folder (Downloading To) : " + str(dataDestinationFolder))
    testFolderPath = os.path.dirname(dataDestinationFolder)
    if not os.path.exists(testFolderPath):
        os.makedirs(testFolderPath)
        print("-Created a new folder at path: " + str(testFolderPath))
        
    
    
    # Connect to the FTP Server and download all of the files in the list.
    ftp_Connection = None

    print("-Downloading files... this may take a few minutes....")
    downloadCounter = 0
    # Iterate through all of our expected file paths
    for ftpFullFilePaths in expected_FTP_FilePaths: 
        
        isError = False
        errorLog = []
        if(downloadCounter % 10 == 0):
            print("-Downloaded: " + str(downloadCounter) + " rasters so far..")
        # Get the file names
        filenameOnly_Tif = ftpFullFilePaths['ftpPathTo_tif'].split('/')[-1]
        filenameOnly_Tfw = filenameOnly_Tif[:-2] + "fw" # Remove part of the extension
        #ftpFullFilePaths['ftpPathTo_tfw'].split('/')[-1]
        
        # Make local filenames
        local_FullFilePath_ToSave_Tif = os.path.join(dataDestinationFolder, filenameOnly_Tif)
        local_FullFilePath_ToSave_Twf = os.path.join(dataDestinationFolder, filenameOnly_Tfw)
        
        # Get directoryPath and Filename for FTP Server
        ftp_PathTo_TIF = ftpFullFilePaths['ftpPathTo_tif'] #IMERG_DataClass._get_FTP_FolderPath_From_FullFilePath(ftpFullFilePaths['ftpPathTo_tif'])
        ftp_PathTo_TWF= ftpFullFilePaths['ftpPathTo_tif'][:-2] + "fw"# IMERG_DataClass._get_FTP_FolderPath_From_FullFilePath(ftpFullFilePaths['ftpPathTo_tfw'])

        # Download the Tif

        fx= open(local_FullFilePath_ToSave_Tif, "wb")
        fx.close()
        os.chmod(local_FullFilePath_ToSave_Tif,0777)	
        print "creating file: " + local_FullFilePath_ToSave_Tif
        print "download path: " + ftp_PathTo_TIF
        try:
            urllib.urlretrieve(ftp_PathTo_TIF, local_FullFilePath_ToSave_Tif)
        except Exception, e:
            os.remove(local_FullFilePath_ToSave_Tif)  
            print "removing the tif file: " + str(e)
        # Download the Tfw
        fx= open(local_FullFilePath_ToSave_Twf, "wb")
        fx.close()
        os.chmod(local_FullFilePath_ToSave_Twf,0777)	
        try:
            urllib.urlretrieve(ftp_PathTo_TWF, local_FullFilePath_ToSave_Twf)
        except:
            os.remove(local_FullFilePath_ToSave_Twf)  
            print "removing the twf file"
        if isError == True:
            # try and remove the file??
            pass
        
        downloadCounter += 1

    
    pass


# Expected input:
# - startDate (YYYYMMDD)
# - endDate (YYYYMMDD)
if __name__ == '__main__':
    print "Starting Downloading IMERG Data"
    args = len(sys.argv)
    if (args < 3):
        try:
        	conn = bdp.BDDbConnector_Capabilities()
        	currentValue = conn.get_Capabilities(26)
        	capabilities_Unwrapped = json.loads(currentValue)
        	theDateSplit = capabilities_Unwrapped["endDateTime"].split("_")
        	startDate = theDateSplit[0] + theDateSplit[1] + theDateSplit[2]
        	endDate= datetime.datetime.today().strftime('%Y%m%d')
        	print "IMERG_Downloader: Working on Date Range: ", startDate, " - ", endDate
        	download_IMERG(startDate, endDate)
        	print "IMERG_Downloader: Done"
        except Exception, e:
        	print "it failed: " + str(e)
        sys.exit()
    else :
        print "IMERG_Downloader: Working on Date Range: ", sys.argv[1], " - ", sys.argv[2]
        download_IMERG(sys.argv[1], sys.argv[2])
        print "IMERG_Downloader: Done"
        
