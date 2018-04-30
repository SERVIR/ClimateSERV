'''
Created on Jan 24, 2014

@author: jeburks
'''
from osgeo import gdal
import geotifftools as gtt
import TestClipper as tc
import ExtractValues as ex
import readgeodata as rdgeo
from os import listdir
from os.path import isfile, join
import time
import tables
import numpy as np

def getValuesForDay(hdfFile, year, month, day, mask):
        output = h5file.getNode("/precip/"+year+"/"+month, day)
        array =  output[:][:,:]
        masked = np.ma.masked_array(array, mask=np.logical_not(mask), fill=-9999)
        newarray = masked != -9999
        sumvalue = float(masked[newarray].sum())
        count = float(newarray.count())
        avg = sumvalue/count
        #print "sum =",sumvalue," count=",count, "avg=",avg
        return [sumvalue,count]
    
    
    
    
###Assemble list of days

# Load the source data for the image
ds = gtt.openGeoTiff("/Users/jeburks/work/data/SERVIR/chirps/2013/chirps-v1.7.2013.01.01.tif")
# ##Open image to array
srcArray = gtt.readBandFromFile(ds,1)
srcImage = gdal.Open("/Users/jeburks/work/data/SERVIR/chirps/2013/chirps-v1.7.2013.01.01.tif")
geoTrans = ds.GetGeoTransform()   
    # 
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/kenya.geojson")
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/zaire.geojson")
ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/mypoly.geojson")
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/mypoly2.geojson")
#ring = rdgeo.decodeShapefile("/Users/jeburks/work/data/SERVIR/gis/Country_shp/zaire.shp", "zaire")
print ring

mask = tc.rasterizePolygon(ds,ring)

day = "07"
month = "07"
year = "2013"

print "going to get the value"
sourcedir = "/Users/jeburks/work/data/SERVIR/chirps/hdf5/"
start  = time.time()
sourcefile = sourcedir+year+'.hdf' 
h5file = tables.openFile(sourcefile, 'r')
getValuesForDay(h5file,year,month,day,mask)
h5file.close()
delta = time.time()-start
print "Done",delta







# dst_ds = gtt.createGeoTiff(outputFile, ds.RasterXSize, ds.RasterYSize, gdal.GDT_Float32,gtt.getSpatialRefOfImage(ds))
# dst_ds.SetGeoTransform(geoTrans)
# srs = osr.SpatialReference()
# srs.ImportFromEPSG(4326)
# dst_ds.SetProjection(srs.ExportToWkt())
# # 
# dst_ds.GetRasterBand(1).WriteArray( mask )
# dst_ds.FlushCache()
# dst_ds = None
'''
Created on Jan 24, 2014

@author: jeburks
'''
