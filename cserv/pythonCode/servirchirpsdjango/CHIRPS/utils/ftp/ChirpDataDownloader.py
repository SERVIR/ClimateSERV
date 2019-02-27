'''
Created on March 29, 2018

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


rootftpdir ='/pub/org/chg/products/CHIRP/daily/'
rootoutputdir =  params.dataTypes[0]['inputDataLocation']

    
    
def getFilesForDate(yyyy, mm, dd):
    '''
    :param ftp:
    :param yyyy
    :param mm
    :param dd
    '''
    print "Getting files for Year:",yyyy,"from ",mm,"/",dd
    ftp = FTP('chg-ftpout.geog.ucsb.edu')
    ftp.login()
    ftp.set_pasv(True)
    ldatestring = dd + " " + mm + " " + yyyy
    ldate = datetime.datetime.strptime(ldatestring, "%d %m %Y")
    date = ldate + datetime.timedelta(days=1)
    print date.strftime('%Y.%m.%d')
    print date.year
    ftp.cwd(rootftpdir+"/"+str(yyyy))
    filelist = [] #to store all files in directory
    ftp.retrlines('LIST',filelist.append)    # append to list 
	
    #loop dates until present, only download if file exists.
    # download file then add day
    #check if year is the same
    # if not cwd to new year
    #present = datetime.now()
    #past.date() < present.date()
    while date.date() < datetime.datetime.now().date():
        filetodownload = "chirp." + date.strftime('%Y.%m.%d') + ".tif"
        f=0
        for f in filelist:
            if filetodownload in f:
                f=1
                break
        if f==1:
            file_path = rootoutputdir+str(date.year)+"/"+filetodownload
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                print "file exists, no download needed"
            else:
                print "Downloading ",filetodownload
                fileToWriteTo = open(file_path, 'wb')
                ftp.retrbinary('RETR '+filetodownload, fileToWriteTo.write)
                fileToWriteTo.close()
                time.sleep(1)
		
		#download finished, adding date and cwd if needed
        date = date + datetime.timedelta(days=1)

        if str(date.year) != str(yyyy):
            print "need cwd"
            ftp.cwd(rootftpdir+"/"+str(date.year))
            yyyy = str(date.year)
            filelist = []
            ftp.retrlines('LIST',filelist.append)
	
	
    ftp.quit()

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
        

def getLastCHIRPSDate():
	try:
		changed = False
		with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
			data = json.load(f)
			for item in data['items']:
				print(item['name'])
				if(item['name'] == 'chirps'):
					ldatestring = item['Latest']
					return ldatestring
	except Exception as e:
		print(e)
		pass

if __name__ == '__main__':
    print "Starting Downloading of CHIRP Data"
    #####Go get date from json file
    theDate = getLastCHIRPSDate()
    day,month,year=theDate.split(' ')
    print theDate
    print day.zfill(2) 
    print month.zfill(2) 
    print year
    print "*******************should be getting 2019************************"
    createEndDirectory(year)
    getFilesForDate(year, month, day)
    print "Done"
