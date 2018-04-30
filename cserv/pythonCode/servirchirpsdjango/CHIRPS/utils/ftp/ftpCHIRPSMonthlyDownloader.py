'''
Created on May 2016

@author: Kris Stanton

Some Portions of this code were taking from @author: jeburks
'''

import sys
import datetime
import ftplib
import time
import calendar


#from ftplib import FTP
import re
import os.path as path
import gzip
import os
#import sys
import CHIRPS.utils.configuration.parameters as params


# Items to move into their own CHIRPS data Class
ftp_FolderPath = "/pub/org/chg/products/CHIRPS-2.0/global_monthly/tifs/"
ftp_HostAddress = "chg-ftpout.geog.ucsb.edu"
patternWithoutgz = re.compile(r"(.*)\.gz$")


# Support for incrementing by months 
def add_months(sourceDateTime,months):
    month = sourceDateTime.month - 1 + months
    year = int(sourceDateTime.year + month / 12 )
    month = month % 12 + 1
    day = min(sourceDateTime.day,calendar.monthrange(year,month)[1])
    #return datetime.date(year,month,day)
    return datetime.datetime(year,month,day)


# support function to facilitate gunziping
def gunzipFile(fileInput):
    '''
    
    :param fileInput:
    '''
    # Uncomment if needed to debug
    #print "gunzipping the file:"+fileInput
    
    dirFile = path.dirname(fileInput)
    filename = path.basename(fileInput)
    m = patternWithoutgz.search(filename)
    fileWithoutgz = m.group(1)
    filetogunzip = fileInput
    fileOut = dirFile+"/"+fileWithoutgz
    f_in = gzip.open(filetogunzip, 'rb')
    f_out = open(fileOut, 'wb')
    f_out.writelines(f_in)
    f_out.close()
    f_in.close()
    
    ##Remove the gzip file
    os.remove(filetogunzip)
    
    # Uncomment if needed to debug
    #print "Done gunzipping "+fileInput


# Tests 20160105 20160109
def download_CHIRPS_Monthly(startYYYYMM, endYYYYMM):

    current_DataTypeNumber = 28  # Hardcoded until there is a better way to get this information (maybe params DB?)
    FTP_Host = ftp_HostAddress
    FTP_UserName = "anonymous"
    FTP_UserPass = "anonymous"
    
    # Convert to dates
    dateFormat = "%Y%m"
    start_Date = datetime.datetime.strptime(startYYYYMM, dateFormat)
    end_Date = datetime.datetime.strptime(endYYYYMM, dateFormat)
    
    expected_FTP_FilePaths = [] 
    # iterate through all dates (in this case, each date is a month and year
    #delta = end_Date - start_Date
    #for i in range(delta.month + 1):
    # Because delta time does not work with months
    end_Date = add_months(end_Date, 1) # this is to fix that hacky while loop found below
    tempDate = start_Date
    while((end_Date - tempDate).days > 0):
        #currentDate = start_Date + datetime.timedelta(months=i)
        currentDate = tempDate
        
    
        theCurrentPath = ftp_FolderPath + "chirps-v2.0." + str(currentDate.year) + "." + str("%02d" % currentDate.month) + ".tif.gz"
        expected_FTP_FilePaths.append(theCurrentPath)
        print("-Expected Path: " + str(theCurrentPath))
        
        # Increment and set new temp value for while loop
        currentDate = add_months(tempDate,1)
        tempDate = currentDate
        
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
    try:
        ftp_Connection = ftplib.FTP(FTP_Host, FTP_UserName, FTP_UserPass)
        time.sleep(1)
    except:
        e = sys.exc_info()[0]
        print("-ERROR Connecting to FTP.. bailing out..., System Error Message: " + str(e))
        return
    
    print("-Downloading files... this may take a few minutes....")
    downloadCounter = 0
    # Iterate through all of our expected file paths
    for ftpFullFilePaths in expected_FTP_FilePaths: 
        
        isError = False
        errorLog = []
        
        # print progress
        if(downloadCounter % 10 == 0):
            print("-Downloaded: " + str(downloadCounter) + " rasters so far..")
        # Get the file names
        #filenameOnly_Tif = ftpFullFilePaths['ftpPathTo_tif'].split('/')[-1]
        filenameOnly = ftpFullFilePaths.split('/')[-1]
        
        # Make local filenames
        local_FullFilePath_ToSave_GZ = os.path.join(dataDestinationFolder, filenameOnly)
        
        # Get directoryPath and Filename for FTP Server
        ftp_PathTo_GZ = ftpFullFilePaths #os.path.join(ftp_FolderPath, filenameOnly)
        
        # Download the Tif
        try:
            with open(local_FullFilePath_ToSave_GZ, "wb") as f:
                ftp_Connection.retrbinary("RETR " + ftp_PathTo_GZ, f.write)  # "RETR %s" % ftp_PathTo_TIF
        except:
            errorStr = "-ERROR Downloading GZ file: " + ftp_PathTo_GZ
            print(errorStr)
            errorLog.append(errorStr)
            isError = True
        
        # Give the FTP Connection a short break (Server spam protection mitigation)
        time.sleep(1)
        
        # Unzip and remove the zip..
        try:
            gunzipFile(local_FullFilePath_ToSave_GZ)
        except:
            errorStr = "-ERROR (gunzip Failed) Failed to extract TIF file from GZ: " + local_FullFilePath_ToSave_GZ
            print(errorStr)
            errorLog.append(errorStr)
            isError = True
            
            
        if isError == True:
            # try and remove the file??
            pass
        
        downloadCounter += 1
        
        
    #STOPPED RIGHT HERE!!! KEEP GOING!

# Expected input:
# - startDate (YYYYMMDD)
# - endDate (YYYYMMDD)
if __name__ == '__main__':
    print "Starting Downloading CHIRPS Monthly Data"
    args = len(sys.argv)
    if (args < 3):
        print "Usage: StartDate(YYYYMM) EndDate(YYYYMM)"
        sys.exit()
    else :
        print "CHIRPS_Monthly_Downloader: Working on Date Range: ", sys.argv[1], " - ", sys.argv[2]
        download_CHIRPS_Monthly(sys.argv[1], sys.argv[2])
        print "CHIRPS_Monthly_Downloader: Done"
        
        
        






## Old Code taken from Other FTP Chirps Ingest file
#
#validFile = re.compile(r"\.tif")
#gzFilePattern = re.compile(r"\.tif\.gz$")
#rootftpdir ='/pub/org/chg/products/CHIRPS-2.0/global_monthly/tifs/'
#rootoutputdir =  params.dataTypes[28]['inputDataLocation']
## Need /global_monthly/ for climatology ingest
#    
#    
#    
#def getFilesForYearAndMonth(ftp,yearToGet, monthToGet):
#    '''
#    
#    :param ftp:
#    :param yearToGet:
#    :param monthToGet:
#    '''
#    print "Getting files for Year:",yearToGet,"Month: ",monthToGet
#    ftp.cwd(rootftpdir+"/"+str(yearToGet))
#    print "Get List of files for ",yearToGet," ",monthToGet
#    files = ftp.nlst()
#    for fileToProcess in files:
#        patternForYearAndMonth = re.compile(r"\."+str(yearToGet)+"\."+"{:0>2d}".format(monthToGet)+"\..*\.tif")
#        if validFile.search(fileToProcess):
#            if  patternForYearAndMonth.search(fileToProcess):
#                print "Downloading ",fileToProcess
#                fileToWriteTo = open(rootoutputdir+str(yearToGet)+"/"+fileToProcess, 'wb')
#                ftp.retrbinary('RETR '+fileToProcess, fileToWriteTo.write)
#                fileToWriteTo.close()
#                if (gzFilePattern.search(fileToProcess)):
#                    try :
#                        print "Gunzipping the file: ",fileToProcess
#                        gunzipFile(rootoutputdir+str(yearToGet)+"/"+fileToProcess)
#                    except IOError:
#                        print "************error processing "+fileToProcess
#
#
#def createEndDirectory(year):
#    '''
#    
#    :param year:
#    '''
#    fullPath = rootoutputdir+str(year)
#    if os.path.exists(fullPath) == False:
#        print "Need to create "+fullPath
#        os.makedirs(fullPath)
#    else:
#        print "Directory already exists "+fullPath
#        
#def processYearAndMonth(yearToGet, monthToGet):
#    '''
#    
#    :param yearToGet:
#    :param monthToGet:
#    '''
#    
#    print "-------------------------------Working on ",monthToGet,"/",yearToGet,"------------------------------------"
#    ftp = FTP('chg-ftpout.geog.ucsb.edu')
#    ftp.login()
#    ftp.set_pasv(True)
#    getFilesForYearAndMonth(ftp  , yearToGet, monthToGet)
#    ftp.quit()
#    print "-----------------------------Done working on ",monthToGet,"/",yearToGet,"---------------------------------"
#
#
#if __name__ == '__main__':
#    print "Starting Downloading CHIRPS Data"
#    args = len(sys.argv)
#    if (args < 3):
#        print "Usage: Startyear endyear"
#        sys.exit()
#    else :
#        print "Working on years ",sys.argv[1],"-",sys.argv[2]
#        #####Go get range of years
#        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
#        print years
#        for year in years:
#            createEndDirectory(year)
#            for month in range(1,13):
#                print "Processing Month:",month," Year ",year
#                processYearAndMonth(year,month)
#        print "Done"





