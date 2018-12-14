'''
Created on May 31, 2017

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

def processYearByDirectory(dataType,year, inputdir):
    '''
    
    :param dataType:
    :param year:
    :param inputdir:
    '''
    ###Process the incoming data
   
    dataStore = dataS.datastorage(dataType, year, forWriting=True)
    indexer = params.dataTypes[dataType]['indexer']
    for filename in os.listdir(inputdir):
        if filename.endswith(".tif"):
            
            fileToProcess = inputdir+"/"+filename
            print "Processing "+fileToProcess
            directory, fileonly = os.path.split(fileToProcess)
        
            dictionary = dateutils.breakApartEsiName(fileonly)
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
            index = indexer.getIndexBasedOnDate(day,month,year)
            print "Index:",index
            try:
            	if dataType == 29:
					dataName = 'esi4week'
            	else:
					dataName = 'esi12week'
            	changed = False
            	with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
					data = json.load(f)
					for item in data['items']:
						print(item['name'])
						if(item['name'] == dataName):
							ldatestring = item['Latest']
							ldate = datetime.datetime.strptime(ldatestring, "%d %m %Y")
							print("in here")
							print("ldate: " + str(ldate))
							if ldate < filedate:
								print("file date is later")
								item['Latest'] = sdate
								changed = True
					if changed:
						f.seek(0)        # <--- should reset file position to the beginning.
						json.dump(data, f, indent=4)
						f.truncate()     # remove remaining part
            except Exception as e:
				print(e)
				pass
            dataStore.putData(index, img)
            
    dataStore.close()
    dataS.writeSpatialInformation(params.dataTypes[dataType]['directory'],prj,grid,year)
    

if __name__ == '__main__':
    print "Starting Ingesting ESI Data"
    args = len(sys.argv)
    if (args < 3):
        print "Usage : Startyear endyear"
        sys.exit()
    else :
        print "Working on years ",sys.argv[1],"-",sys.argv[2]
        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
        for year in years:
            print "-------------------------------------------------------------Processing ",year,"-----------------------------------------------------"
            processYearByDirectory(29,year,params.dataTypes[29]['inputDataLocation']+str(year))
            print "-------------------------------------------------------------Done Processing ",year,"-----------------------------------------------------"
