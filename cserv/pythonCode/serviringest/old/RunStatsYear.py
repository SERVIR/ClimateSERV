'''
Created on Jan 24, 2014

@author: jeburks
'''
from osgeo import gdal
import geotifftools.geotifftools as gtt
import TestClipper as tc
import ExtractValues as ex
import readgeodata as rdgeo
from os import listdir
from os.path import isfile, join
import timeit

if __name__ == '__main__':
    pass

data_dir = "/Users/jeburks/work/data/SERVIR/chirps/2013/"


onlyfiles = [ join(data_dir,f) for f in listdir(data_dir) if isfile(join(data_dir,f)) and f.endswith("tif") ]
onlyfiles.sort()

print "Only files "+onlyfiles[1]
# Load the source data for the image
ds = gtt.openGeoTiff(onlyfiles[1])
# ##Open image to array
srcArray = gtt.readBandFromFile(ds,1)
srcImage = gdal.Open(onlyfiles[1])
geoTrans = ds.GetGeoTransform()   
    # 
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/kenya.geojson")
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/zaire.geojson")
ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/mypoly.geojson")
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/mypoly2.geojson")
#ring = rdgeo.decodeShapefile("/Users/jeburks/work/data/SERVIR/gis/Country_shp/zaire.shp", "zaire")
print ring
mask = tc.rasterizePolygon(ds,ring)
count =0
total = 0
totalsum = 0
for filetoprocess in onlyfiles :
    #print filetoprocess
    values = ex.extractValue(mask, filetoprocess)
    total += values[0]
    totalsum += values[1]
  #  print "fileToProcess ", filetoprocess, " sum=",values[0]," count=",values[1]," avg=",(values[0]/values[1])
    ++count
    #jan1 = ex.extractValue(mask, raster)
    
print "overall total =",total," totalsum=",totalsum, "avg= ",(total/totalsum)








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
