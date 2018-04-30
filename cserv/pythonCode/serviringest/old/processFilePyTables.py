# -*- coding: utf-8 -*-
"""
Created on Wed Feb 12 12:27:35 2014

@author: jasonburks
"""
import dateutils
import sys
import os
import geotiff2hdf as geohdf 
import tables
import os.path
import numpy as np

baseYear = 2010;
##Regular grid. the grid x,y,day of year. But the day of the year assumes that each month has 31. This is done to make the grid regular
##All dates that are non represented are filled with fill value.
##This allows quick slicing of the grid using indexes
bFilter = tables.Filters(complib='blosc', complevel=5)
def getFilename(outputdir, year):
    return outputdir+str(year)+'.hdf' 
    
def createOrOpenYearFile(outputdir, year):
    outputfile = getFilename(outputdir, year)
    if (os.path.isfile(outputfile) !=  True) :
        print "Need to create new file for ", year
        h5file = tables.openFile(outputfile, 'a', title = "CHIRPS Precip data year:"+str(year))
        #try :
         #   h5file.getNode("/",'precip')
        #except tables.exceptions.NoSuchNodeError:
         #   h5file.createGroup("/",'precip','precip')
        
        array= np.zeros((1600,1500,372), dtype=np.float32);
        array[:] = -9999.99;
        #print array.dtype
        atomItem = tables.Atom.from_dtype(array.dtype)
       # print "atom ",atomItem
        #arrayNode =  h5file.createCArray(h5file.root,'hello',atom=atomItem,shape=array.shape, title=year, filters=bFilter)
        arrayNode =  h5file.createCArray("/",'precip',atomItem, array.shape,filters=bFilter)
        arrayNode[:] = array
        arrayNode.flush()
        return h5file
    else:
        print "File Already exists so just opening it"
        h5file = tables.openFile(outputfile, 'a', title = "CHIRPS Precip data year:"+str(year))
        return h5file
        

def processFile(outputdir, array, year, month, day):
    print "Processing file"
    h5file = createOrOpenYearFile(outputdir, year)
    index =  (month-1)*31 + (day-1)
    h5file.root.precip[:,:,index] = array
    h5file.root.precip.flush()
    h5file.close()
    
         
    
        
    
  


###Process the incoming data
##inputdir = sys.argv[1]
inputdir = "/Users/jeburks/work/data/SERVIR/chirps/2013"
outputdir = "/Users/jeburks/work/data/SERVIR/chirps/hdf5/"
for filename in os.listdir(inputdir):
    if filename.endswith(".tif"):
            
        fileToProcess = inputdir+"/"+filename
        dirrectory, fileonly = os.path.split(fileToProcess)
        

        dictionary = dateutils.breakApartChripsName(fileToProcess)
        year = dictionary['year']
        month = dictionary['month']
        day = dictionary['day']


       

        img =  geohdf.readInGeoTiff(fileToProcess)
        # print "Getting ready to create hdf5 file"
        processFile(outputdir,img,year,month,day)

# # 
# # for filename in os.listdir(inputdir):
# #     if filename.endswith(".tif"):
# #             
# #         fileToProcess = inputdir+"/"+filename
# #         dirrectory, fileonly = os.path.split(fileToProcess)
# #         
# # 
# #         dictionary = dateutils.breakApartChripsName(fileToProcess)
# #         year = dictionary['year']
# #         month = dictionary['month']
# #         day = dictionary['day']
# # 
# # 
# #        
# # 
# #         img =  geohdf.readInGeoTiff(fileToProcess)
# #         # print "Getting ready to create hdf5 file"
# #         processFile(outputdir,img,year, month,day)
# #         print "Done Processing:",year,'/',month,'/',day




