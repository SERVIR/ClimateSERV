'''
Created on Mar 4, 2015

@author: jeburks 
'''
import CHIRPS.utils.file.dateutils as dateutils
import os.path
import CHIRPS.utils.geo.geotiff.geotifftools as georead
import CHIRPS.utils.configuration.parameters as params
import sys
import CHIRPS.utils.file.h5datastorage as dataS
import json
import datetime
import time


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
        if filename.endswith(".tif") and "chirps" in filename:
            
            fileToProcess = inputdir+"/"+filename
            print "Processing "+fileToProcess
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
            time.sleep(1)
            img = georead.readBandFromFile(ds, 1)

            
            index = indexer.getIndexBasedOnDate(day,month,year)
            print "Index:",index
            try:
            	changed = False
            	with open('/data/data/cserv/www/html/json/stats.json', 'r+') as f:
					data = json.load(f)
					for item in data['items']:
						if(item['name'] == 'chirps'):
							ldatestring = item['Latest']
							ldate = datetime.datetime.strptime(ldatestring, "%d %m %Y")
							if ldate < filedate:
								item['Latest'] = sdate
								changed = True
					if changed:
						f.seek(0)        # <--- should reset file position to the beginning.
						json.dump(data, f, indent=4)
						f.truncate()     # remove remaining part
            except Exception as e:
				print("******************" + e + "****************************")
				pass
            time.sleep(1)				
            dataStore.putData(index, img)
            time.sleep(1)
            ds = None
    dataStore.close()
    dataS.writeSpatialInformation(params.dataTypes[dataType]['directory'],prj,grid,year)
    

if __name__ == '__main__':
    print "Starting Ingesting CHIRPS Data"
    args = len(sys.argv)
    if (args < 3):
        print "Usage : Startyear endyear"
        sys.exit()
    else :
        print "Working on years ",sys.argv[1],"-",sys.argv[2]
        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
        for year in years:
            print "-------------------------------------------------------------Processing ",year,"-----------------------------------------------------"
            processYearByDirectory(0,year,params.dataTypes[0]['inputDataLocation']+str(year))
            print "-------------------------------------------------------------Done Processing ",year,"-----------------------------------------------------"
