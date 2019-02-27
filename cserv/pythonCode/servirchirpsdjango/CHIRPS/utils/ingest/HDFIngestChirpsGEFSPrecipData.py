'''
Created on January 24, 2018

@author: Sarva Pulla
'''
import CHIRPS.utils.file.dateutils as dateutils
import os
import os.path
import CHIRPS.utils.geo.geotiff.geotifftools as georead
import CHIRPS.utils.configuration.parameters as params
import sys
import CHIRPS.utils.file.h5datastorage as dataS
import json
import datetime

def processYearByDirectory(dataType,year, inputdir, nlastdate):
    '''
    
    :param dataType:
    :param year:
    :param inputdir:
    '''
    ###Process the incoming data
    print inputdir
    dataupdated = False
    dataStore = dataS.datastorage(dataType, year, forWriting=True)
    indexer = params.dataTypes[dataType]['indexer']
    for filename in os.listdir(inputdir):
        filesplit = filename.split('.') 
        fyear = filesplit[1]
        fmonth = filesplit[2][:2]
        fday = filesplit[2][2:]
        fdatestring = fday + " " + fmonth + " " + fyear
        fdate = datetime.datetime.strptime(fdatestring, "%d %m %Y")
        if fdate > nlastdate:
			if filename.endswith(".tif") and os.stat(inputdir+"/"+filename).st_size > 0:
				dataupdated = True
				fileToProcess = inputdir+"/"+filename
				print "Processing "+fileToProcess
				directory, fileonly = os.path.split(fileToProcess)
			
				dictionary = dateutils.breakApartGEFSNewName(fileonly) #name convention changed, update needed
				year = dictionary['year']
				month = dictionary['month']
				day = dictionary['day']
				sdate = "{0} {1} {2}".format(day, month, year)
				filedate = datetime.datetime.strptime(sdate, "%d %m %Y")
				ds = georead.openGeoTiff(fileToProcess)
				prj=ds.GetProjection()
				grid = ds.GetGeoTransform()
				# day = decad * 10
				# if month == int(2)  and day == int(30):
				#     day = 28
				img =  georead.readBandFromFile(ds, 1)
				ds = None
				index = indexer.getIndexBasedOnDate(day,month,year)
				print "Index:",index
				try:
					changed = False
					with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
						data = json.load(f)
						for item in data['items']:
							if(item['name'] == 'gefsprecip'):
								ldatestring = item['Latest']
								ldate = datetime.datetime.strptime(ldatestring, "%d %m %Y")
								if ldate < filedate:
									print("file date is later")
									item['Latest'] = sdate
									changed = True
						if changed:
							f.seek(0)        # <--- should reset file  position to the beginning.
							json.dump(data, f, indent=4)
							f.truncate()     # remove remaining part
				except Exception as e:
					print(e)
					pass
				dataStore.putData(index, img)

    dataStore.close()
    if dataupdated:
		dataS.writeSpatialInformation(params.dataTypes[dataType]['directory'],prj,grid,year)
def getLastGEFSPrecipDate():
	try:
		changed = False
		with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
			data = json.load(f)
			for item in data['items']:
				if(item['name'] == 'gefsprecip'):
					ldatestring = item['Latest']
					return ldatestring
	except Exception as e:
		print(e)
		pass

if __name__ == '__main__':
    theDate = getLastGEFSPrecipDate()
    day,month,year=theDate.split(' ')
    ldatestring = day + " " + month + " " + year
    #ldatestring = "01" + " " + "01" + " " + "2019"
    lastdate = datetime.datetime.strptime(ldatestring, "%d %m %Y")
    print "-------------------------------------------------------------Processing ",year,"-----------------------------------------------------"

    processYearByDirectory(32,int(year),params.dataTypes[32]['inputDataLocation']+str(year), lastdate)
    print "-------------------------------------------------------------Done Processing ",year,"-----------------------------------------------------"
