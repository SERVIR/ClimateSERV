'''
Created on Oct 6, 2014

@author: jeburks
'''
from ftplib import FTP
import re
import os.path as path
import gzip
import os
import sys
import CHIRPS.utils.configuration.parameters as params
import time

validFile = re.compile(r"\.tif")
gzFilePattern = re.compile(r"\.tif\.gz$")
patternWithoutgz = re.compile(r"(.*)\.gz$")
rootftpdir ='/pub/org/chg/products/CHIRPS-2.0/global_daily/tifs/p05/'
rootoutputdir =  params.dataTypes[0]['inputDataLocation']


def gunzipFile(fileInput):
    '''
    
    :param fileInput:
    '''
    print "gunzipping the file:"+fileInput
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
    print "Done gunzipping "+fileInput
    
    
    
    
def getFilesForYearAndMonth(ftp,yearToGet, monthToGet):
    '''
    
    :param ftp:
    :param yearToGet:
    :param monthToGet:
    '''
    print "Getting files for Year:",yearToGet,"Month: ",monthToGet
    ftp.cwd(rootftpdir+"/"+str(yearToGet))
    print "Get List of files for ",yearToGet," ",monthToGet
    files = ftp.nlst()
    for fileToProcess in files:
        patternForYearAndMonth = re.compile(r"\."+str(yearToGet)+"\."+"{:0>2d}".format(monthToGet)+"\..*\.tif")
        if validFile.search(fileToProcess):
            if  patternForYearAndMonth.search(fileToProcess):
                print "Downloading ",fileToProcess
                fileToWriteTo = open(rootoutputdir+str(yearToGet)+"/"+fileToProcess, 'wb')
                ftp.retrbinary('RETR '+fileToProcess, fileToWriteTo.write)
                time.sleep(1)
                fileToWriteTo.close()
                time.sleep(1)
                if (gzFilePattern.search(fileToProcess)):
                    try :
                        print "Gunzipping the file: ",fileToProcess
                        gunzipFile(rootoutputdir+str(yearToGet)+"/"+fileToProcess)
                    except IOError:
                        print "************error processing "+fileToProcess


def createEndDirectory(year):
    '''
    
    :param year:
    '''
    fullPath = rootoutputdir+str(year)
    if os.path.exists(fullPath) == False:
        print "Need to create "+fullPath
        os.makedirs(fullPath)
    else:
        print "Directory already exists "+fullPath
        
def processYearAndMonth(yearToGet, monthToGet):
    '''
    
    :param yearToGet:
    :param monthToGet:
    '''
    
    print "-------------------------------Working on ",monthToGet,"/",yearToGet,"------------------------------------"
    ftp = FTP('chg-ftpout.geog.ucsb.edu')
    ftp.login()
    ftp.set_pasv(True)
    getFilesForYearAndMonth(ftp  , yearToGet, monthToGet)
    ftp.quit()
    print "-----------------------------Done working on ",monthToGet,"/",yearToGet,"---------------------------------"


if __name__ == '__main__':
    print "Starting Downloading CHIRPS Data"
    args = len(sys.argv)
    if (args < 3):
        print "Usage: Startyear endyear"
        sys.exit()
    else :
        print "Working on years ",sys.argv[1],"-",sys.argv[2]
        #####Go get range of years
        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
        print years
        for year in years:
            createEndDirectory(year)
            for month in range(1,13):
                print "Processing Month:",month," Year ",year
                processYearAndMonth(year,month)
        print "Done"





