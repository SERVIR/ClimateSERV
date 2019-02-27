'''
Created on Mar 30, 2018

@author: BillyZ 
'''
import CHIRPS.utils.file.dateutils as dateutils
import os.path
import CHIRPS.utils.geo.geotiff.geotifftools as georead
import CHIRPS.utils.configuration.parameters as params
import sys
import CHIRPS.utils.file.h5datastorage as dataS
import json
import datetime
import numpy as np

def processDataStarting(yyyy, mm, dd):
    dataType = 0
    indexer = params.dataTypes[dataType]['indexer']
    inputdir = params.dataTypes[0]['inputDataLocation']+yyyy # will need to update this if year changes
    dataStore = dataS.datastorage(dataType, int(yyyy), forWriting=True)# will need to update this if year changes
    ldatestring = dd + " " + mm + " " + yyyy
    ldate = datetime.datetime.strptime(ldatestring, "%d %m %Y")
    date = ldate + datetime.timedelta(days=1)

    while date.date() < datetime.datetime.now().date():
        fileToProcess = inputdir + "/chirp." + date.strftime('%Y.%m.%d') + ".tif"

        if os.path.exists(fileToProcess) and os.path.getsize(fileToProcess) > 0:
            print "file exists, ingest started on: " +fileToProcess
            directory, fileonly = os.path.split(fileToProcess)
            dictionary = dateutils.breakApartChripsName(fileonly)
            year = dictionary['year']
            month = dictionary['month']
            day = dictionary['day']
            sdate = "{0} {1} {2}".format(day, month, year)
            filedate = datetime.datetime.strptime(sdate, "%d %m %Y")
            ds = georead.openGeoTiff(fileToProcess)
            prj=ds.GetProjection()
            grid = ds.GetGeoTransform()

            img =  georead.readBandFromFile(ds, 1)
            ds = None
            index = indexer.getIndexBasedOnDate(date.day,date.month,date.year)
            print "Index:",index
            c = np.array(dataStore.getData(index))
            if(c==-9999).all() == True:
                dataStore.putData(index, img)
                print date.strftime('%Y.%m.%d') + " data added to hdf"
                try:
					changed = False
					with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
						data = json.load(f)
						for item in data['items']:
							if(item['name'] == 'chirp'):
								ldatestring = item['Latest']
								ldate = date #.strftime("%d %m %Y") #datetime.datetime.strptime(ldatestring, "%d %m %Y")
								if ldate < filedate:
									item['Latest'] = sdate
									changed = True
						if changed:
							f.seek(0)        # <--- should reset file  position to the beginning.
							json.dump(data, f, indent=4)
							f.truncate()     # remove remaining part
                except Exception as e:
					print(e)
					pass
                
            else:
                print date.strftime('%Y.%m.%d') + " data already in hdf"
        else:
            print "nothing to ingest "
        date = date + datetime.timedelta(days=1)

    dataStore.close()
	
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
    print "Starting Ingesting CHIRP on CHIRPS"
    theDate = getLastCHIRPSDate()
    day,month,year=theDate.split(' ')
    processDataStarting(year, month, day)
    print "CHIRP is now on CHIRPS"