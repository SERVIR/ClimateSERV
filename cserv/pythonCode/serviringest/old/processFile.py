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


def processFile(outputdir, array, year, month, day):
    outputfile = outputdir+year+'.hdf' 
    ###Open/Create a hdf5 file of the data if it does not exist.
    bFilter = tables.Filters(complib='blosc', complevel=5)
    h5file = tables.openFile(outputfile, 'a', title = "CHIRPS Precip data year:"+year)
   
    #print "Checking precip node"
    try :
        h5file.getNode("/",'precip')
    except tables.exceptions.NoSuchNodeError:
        h5file.createGroup("/",'precip','precip')
    #print "Checking year node"
    try :
         h5file.getNode("/precip/",year)
    except tables.exceptions.NoSuchNodeError:
         h5file.createGroup("/precip/",year,'year')
    #print "Checking month node"
    try :
         h5file.getNode("/precip/"+year+"/",month)
    except tables.exceptions.NoSuchNodeError:
     #   print "Creating node for ","/precip/"+year+"/"+month
        h5file.createGroup("/precip/"+year+"/",month,'month')
         
    try :    
       atomFromTable = tables.Atom.from_dtype(array.dtype) 
       arrayNode =  h5file.createCArray("/precip/"+year+"/"+month, day,atomFromTable,array.shape, title='day', filters=bFilter)
       arrayNode[:] = array
       arrayNode.flush()
    except tables.exceptions.NodeError:
        arrayNode = h5file.getNode("/precip/"+year+"/"+month, day)
        arrayNode[:] = array
        arrayNode.flush()
        
    
    #print h5file
    h5file.close()


###Process the incoming data
inputdir = sys.argv[1]
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
        processFile(outputdir,img,year, month,day)
        print "Done Processing:",year,'/',month,'/',day




