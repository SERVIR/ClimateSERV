'''
Created on Oct 6, 2014

@author: jeburks
'''

# KS Note (Jan - 2016):  I don't think this file is used any longer..
from ftplib import FTP
import re
import os.path as path
import gzip
import os

validFile = re.compile(r"\.tif\.gz$")
patternWithoutgz = re.compile(r"(.*)\.gz$")
rootftpdir ='/pub/org/chg/products/CHIRPS-2.0/africa_daily/tifs/p05/'
rootoutputdir = '/Users/jeburks/work/SERVIR/Data/Image/Precip/'


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
        patternForYearAndMonth = re.compile(r"\."+str(yearToGet)+"\."+"{:0>2d}".format(monthToGet)+"\..*\.tif\.gz$")
        if validFile.search(fileToProcess):
            if  patternForYearAndMonth.search(fileToProcess):
                print "Downloading ",fileToProcess
                fileToWriteTo = open(rootoutputdir+str(yearToGet)+"/"+fileToProcess, 'wb')
                ftp.retrbinary('RETR '+fileToProcess, fileToWriteTo.write)
                fileToWriteTo.close()
                try :
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
    ftp.set_pasv(False)
    getFilesForYearAndMonth(ftp  , yearToGet, monthToGet)
    ftp.quit()
    print "-----------------------------Done working on ",monthToGet,"/",yearToGet,"---------------------------------"


#####Go get range of years
years = range(2012,2015)
print years
for year in years:
    createEndDirectory(year)
    for month in range(1,13):
        print "Processing Month:",month," Year ",year
        processYearAndMonth(year,month)
print "Done"

###Go get a single year
#processYearAndMonth(1981,1)





