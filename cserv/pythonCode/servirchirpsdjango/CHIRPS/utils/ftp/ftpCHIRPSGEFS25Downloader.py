'''
Created on Jan 24, 2018

@author: BillyZ
'''
from ftplib import FTP
import re
import os.path as path
import gzip
import os
import sys
import CHIRPS.utils.configuration.parameters as params
import time
import json
import datetime

validFile = re.compile(r"\.tif")
gzFilePattern = re.compile(r"\.tif\.gz$")
patternWithoutgz = re.compile(r"(.*)\.gz$")
rootftpdir ='/pub/org/chg/products/EWX/data/forecasts/CHIRPS-GEFS_precip/10day/precip_25prcn/' #'/pub/org/chg/products/EWX/data/forecasts/CHIRPS-GEFS_precip/daily_last/' # '/pub/org/chg/products/EWX/data/forecasts/CHIRPS-GEFS_precip/dekad_first/'
rootoutputdir =  params.dataTypes[35]['inputDataLocation']


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
    
    
    
    
def getFilesForYearAndMonth(ftp,yearToGet, monthToGet, day):
    '''
    
    :param ftp:
    :param yearToGet:
    :param monthToGet:
    '''
    ldatestring = day + " " + monthToGet + " " + yearToGet
    ldate = datetime.datetime.strptime(ldatestring, "%d %m %Y")
    print "Getting files after Year:",yearToGet," Month: ",monthToGet, " Date: ",day

    ftp.cwd(rootftpdir)
    #ftp.cwd(rootftpdir + str(yearToGet) + '/')
    print "Get List of files for ",yearToGet," ",monthToGet
    files = ftp.nlst()
    filteredfiles = [f for f in files if 'data-25prcn_'+str(yearToGet) in f]
    for fileToProcess in filteredfiles:
        if validFile.search(fileToProcess):
            if  re.search('data-25prcn_'+str(yearToGet), fileToProcess):
                print fileToProcess
                filesplit = fileToProcess.split('_') 
                fyear = filesplit[2][:4]
                print fyear 
                fmonth = filesplit[2][4:6]
                print fmonth 
                fday = filesplit[2][6:8]
                print fday 
                fdatestring = fday + " " + fmonth + " " + fyear
                fdate = datetime.datetime.strptime(fdatestring, "%d %m %Y")
                if fdate > ldate:
					file_path = rootoutputdir+str(yearToGet)+"/"+fileToProcess

					print "Downloading ",fileToProcess
					#fileToWriteTo = open(rootoutputdir+str(yearToGet)+"/"+fileToProcess, 'wb')
					fileToWriteTo = open(rootoutputdir+str(yearToGet)+"/data."+fyear+"."+("%02d" % (int(fmonth),))+("%02d" % (int(fday),))+".tif", 'wb')
					#print "write file: " + fileToWriteTo 
					ftp.retrbinary('RETR '+fileToProcess, fileToWriteTo.write)
					fileToWriteTo.close()
					time.sleep(1)
					if (gzFilePattern.search(fileToProcess)):
						try :
							print "Gunzipping the file: ",fileToProcess
							gunzipFile(rootoutputdir+str(yearToGet)+"/"+fileToProcess)
						except IOError:
							print "************error processing "+fileToProcess

                else:
					print "Have later data, no need to download: " +  fdatestring
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

def getLastGEFSPrecipDate():
	try:
		changed = False
		with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
			data = json.load(f)
			for item in data['items']:
				if(item['name'] == 'gefsprecip25'):
					ldatestring = item['Latest']
					return ldatestring
	except Exception as e:
		print(e)
		pass
		
def processFilesFromLastDate(yearToGet, monthToGet, lastDate):
    '''
    :param yearToGet:
    :param monthToGet:
    '''
    print "-------------------------------Working on ",monthToGet,"/",yearToGet,"------------------------------------"
    ftp = FTP('ftp.chg.ucsb.edu')
    ftp.login()
    ftp.set_pasv(True)
    getFilesForYearAndMonth(ftp, yearToGet, monthToGet, lastDate)
    ftp.quit()
    print "-----------------------------Done working on ",monthToGet,"/",yearToGet,"---------------------------------"


if __name__ == '__main__':
    print "Starting Downloading CHIRPS GEFS precip Data"


    theDate = getLastGEFSPrecipDate()
    day,month,year=theDate.split(' ')
    createEndDirectory(year)
    processFilesFromLastDate(year, month, day)
    #processFilesFromLastDate("2019", "01", "01")
    time.sleep(5)
    print "Done"





