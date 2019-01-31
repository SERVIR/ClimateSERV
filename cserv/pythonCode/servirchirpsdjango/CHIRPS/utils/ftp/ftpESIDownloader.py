'''
Created on July 17, 2017

@author: BillyZ,Githika
'''
import re
import os.path as path
import gzip
import os
import sys
import urllib2
import requests
from bs4 import BeautifulSoup as bs
import CHIRPS.utils.configuration.parameters as params
import json
from datetime import datetime

validFile = re.compile(r"\.tif")
gzFilePattern = re.compile(r"\.tif\.gz$")
patternWithoutgz = re.compile(r"(.*)\.gz$")
roothttpsdir ='/SPoRT/outgoing/crh/4servir/'
rootoutputdir4WK =  params.dataTypes[29]['inputDataLocation']
rootoutputdir12WK =  params.dataTypes[33]['inputDataLocation']


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
    
    
    
    
def getFilesForYear(files_urls,yearToGet):
    '''
    
    :param files with urls:
    :param yearToGet:
    '''
    print "Getting files for Year:",yearToGet
    print "*********************roothttpsdir: ", roothttpsdir
    print "Get List of files for ",yearToGet
    #day = 8	
    #prefix="DFPPM_4WK_"
    for fileToProcess,url in files_urls:
        if validFile.search(fileToProcess):
			print "Downloading ",fileToProcess
			rq = urllib2.Request(url)
			res = urllib2.urlopen(rq)
			if "4WK" in fileToProcess:
				fileToWriteTo = open(rootoutputdir4WK+str(yearToGet)+"/"+fileToProcess, 'wb')
				fileToWriteTo.write(res.read())
				fileToWriteTo.close()
				os.chmod(rootoutputdir4WK+str(yearToGet)+"/"+fileToProcess, 0o777)
				if (gzFilePattern.search(fileToProcess)):
					try :
						print "Gunzipping the file: ",fileToProcess
						gunzipFile(rootoutputdir4WK+str(yearToGet)+"/"+fileToProcess)
						os.chmod(rootoutputdir4WK+str(yearToGet)+"/"+fileToProcess.replace(".gz", ""), 0o777)
					except IOError:
						print "************error processing "+fileToProcess
			if "12WK" in fileToProcess:
				fileToWriteTo = open(rootoutputdir12WK+str(yearToGet)+"/"+fileToProcess, 'wb')
				fileToWriteTo.write(res.read())
				fileToWriteTo.close()
				os.chmod(rootoutputdir12WK+str(yearToGet)+"/"+fileToProcess, 0o777)
				if (gzFilePattern.search(fileToProcess)):
					try :
						print "Gunzipping the file: ",fileToProcess
						gunzipFile(rootoutputdir12WK+str(yearToGet)+"/"+fileToProcess)
						os.chmod(rootoutputdir12WK+str(yearToGet)+"/"+fileToProcess.replace(".gz", ""), 0o777)
					except IOError:
						print "************error processing "+fileToProcess

        #day=day+7									

def createEndDirectory(year):
    '''
    
    :param year:
    '''
    fullPath = rootoutputdir4WK+str(year)
    if os.path.exists(fullPath) == False:
        print "Need to create "+fullPath
        os.makedirs(fullPath)
    else:
        print "Directory already exists "+fullPath
    fullPath = rootoutputdir12WK+str(year)
    if os.path.exists(fullPath) == False:
        print "Need to create "+fullPath
        os.makedirs(fullPath)
    else:
        print "Directory already exists "+fullPath
		
def getESIDate(item):
	if item['name'] == 'esi4week':
		return item
def getDatePattern(url):
	return url.split('_')[2].split('.')[0]
def processYear(yearToGet):
    '''
    
    :param yearToGet:
    '''
    filePattern = None
    print "-------------------------------Working on ",yearToGet,"------------------------------------"
    with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
		data = json.load(f)
		theDate = filter(getESIDate, data['items'])[0]['Latest']
		filePattern = theDate.split(' ')[2] + str("%03d" % ((datetime.strptime(theDate, '%d %M %Y') - datetime(2019,1,1)).days + 1,))
    response = requests.get('https://geo.nsstc.nasa.gov/SPoRT/outgoing/crh/4servir/')
    soup = bs(response.text,"html.parser")
    urls = []
    names = []
    for i, link in enumerate(soup.findAll('a')):
		_FULLURL = "https://geo.nsstc.nasa.gov/SPoRT/outgoing/crh/4servir/" + link.get('href')
		if _FULLURL.endswith('.tif.gz'):
			#check if datepattern is greater than filePattern
			if int(getDatePattern(link.get('href'))) > int(filePattern):
				urls.append(_FULLURL)
				names.append(soup.select('a')[i].attrs['href'])
    names_urls = zip(names, urls)
    getFilesForYear(names_urls, yearToGet)
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





