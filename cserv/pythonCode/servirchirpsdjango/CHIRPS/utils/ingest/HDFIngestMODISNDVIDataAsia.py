'''
Created on Mar 4, 2015

@author: BillyZ
'''
import CHIRPS.utils.file.dateutils as dateutils
import os.path
import CHIRPS.utils.geo.geotiff.geotifftools as georead
import CHIRPS.utils.configuration.parameters as params
import sys
import CHIRPS.utils.file.h5datastorage as dataS
import numpy as np

def processYearByDirectory(dataType,year, inputdir):
    '''
    
    :param dataType:
    :param year:
    :param inputdir:
    '''
    ###Process the incoming data
   
    #dataStore = dataS.datastorage(dataType, year, forWriting=True)
    indexer = params.dataTypes[dataType]['indexer']
    for filename in os.listdir(inputdir):
        if filename.endswith(".tif"):
            try:
               dataStore = dataS.datastorage(dataType, year, forWriting=True)
               fileToProcess = inputdir+"/"+filename
               print "Processing "+fileToProcess
               directory, fileonly = os.path.split(fileToProcess)
        
               dictionary = dateutils.breakApartemodisNameAdjust(fileonly, 3)

               year = dictionary['year']
               month = dictionary['month']

               day = dictionary['day']
               ds = georead.openGeoTiff(fileToProcess)
               prj=ds.GetProjection()
               grid = ds.GetGeoTransform()

               img =  georead.readBandFromFile(ds, 1)
               try:
               	xSize = params.dataTypes[dataType]['size'][0]
               	img = np.delete(img, (xSize), axis=1)
               	print("Accounting for pixel width differences.")
               except:
               	pass
               try:
               	ySize = params.dataTypes[dataType]['size'][1]
               	img = np.delete(img, (ySize), axis=0) 
               	print("Accounting for pixel height differences.")
               except:
               	pass
               ###Manipulate the data as based on FEWS.NET data document to get NDVI from data.
               #eMODIS NDVI data are stretched (mapped) linearly (to byte values) as follows: 
               #[-1.0, 1.0] -> [0, 200] - Invalid Values: 201 - 255 
               #NDVI = (value - 100) / 100; example: [ (150 - 100) / 100 = 0.5 NDVI ]
            
               #print np.max(img)
               validmask = np.where(img<=200)
               invalidmask = np.where((img>200) | (img<100))
               #print "Max during:",np.max(img[validmask])
               img = img.astype(np.float32)
               img[validmask] = (img[validmask] - 100)/100.
               img[invalidmask] = img[invalidmask]*0+params.dataTypes[dataType]['fillValue']
            
               #print np.max(img)
               ds = None
               index = indexer.getIndexBasedOnDate(day,month,year)
               print month,"/",day,"/",year,"--Index->",index
               #print "Index:",index
               dataStore.putData(index, img)
               img = None
               dataStore.close()
            except:
               print 'Failed adding tif'
               img = None
               dataStore.close()
    #dataStore.close()
    dataS.writeSpatialInformation(params.dataTypes[dataType]['directory'],prj,grid,year)
    

if __name__ == '__main__':
    print "Starting Ingesting eMODIS Data"
    
    print "TODO! FIX FILE NAME ISSUE WITH EMODIS (USGS reversed the numbers for year and itemNumber in the tif file names.  ONCE THIS HAS BEEN MITIGATED, REMOVE THIS MESSAGE!"
    
    args = len(sys.argv)
    if (args < 3):
        print "Usage : Startyear endyear"
        sys.exit()
    else :
        print "Working on years ",sys.argv[1],"-",sys.argv[2]
        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
        for year in years:
            print "-------------------------------------------------------------Processing ",year,"-----------------------------------------------------"
            processYearByDirectory(28,year,params.dataTypes[28]['inputDataLocation']+str(year))
            print "-------------------------------------------------------------Done Processing ",year,"-----------------------------------------------------"
