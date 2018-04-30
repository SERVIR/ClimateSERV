'''
Created on July 17, 2017

@author: BillyZ
'''
from ftplib import FTP
import re
import os.path as path
import gzip
import os
import sys
import CHIRPS.utils.configuration.parameters as params

validFile = re.compile(r"\.tif")
gzFilePattern = re.compile(r"\.tif\.gz$")
patternWithoutgz = re.compile(r"(.*)\.gz$")
rootftpdir ='/SPoRT/people/chain/4servir/'
rootoutputdir =  params.dataTypes[29]['inputDataLocation']


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
    
    
    
    
def getFilesForYear(ftp,yearToGet):
    '''
    
    :param ftp:
    :param yearToGet:
    '''
    print "Getting files for Year:",yearToGet
    print "*********************rootftpdir: ", rootftpdir
    ftp.cwd(rootftpdir + str(yearToGet))
    print "Get List of files for ",yearToGet
    files = ftp.nlst()
    day = 8	
    prefix="DFPPM_4WK_"
    for fileToProcess in files:
        if validFile.search(fileToProcess):
			if "4WK" in fileToProcess:
				print "Downloading ",fileToProcess
				fileToWriteTo = open(rootoutputdir+str(yearToGet)+"/"+fileToProcess, 'wb')
				ftp.retrbinary('RETR '+fileToProcess, fileToWriteTo.write)
				fileToWriteTo.close()
				if (gzFilePattern.search(fileToProcess)):
					try :
						print "Gunzipping the file: ",fileToProcess
						gunzipFile(rootoutputdir+str(yearToGet)+"/"+fileToProcess)
					except IOError:
						print "************error processing "+fileToProcess
        day=day+7									

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
        
def processYear(yearToGet):
    '''
    
    :param yearToGet:
    '''
    
    print "-------------------------------Working on ",yearToGet,"------------------------------------"
    ftp = FTP('geo.nsstc.nasa.gov')
    ftp.login()
    ftp.set_pasv(True)
    getFilesForYear(ftp  , yearToGet)
    ftp.quit()
    print "-----------------------------Done working on ",yearToGet,"---------------------------------"


if __name__ == '__main__':
    print "Starting Downloading ESI Data"
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
        for year in years:			
            processYear(year)
        print "Done"





