'''
Created on Jan 23, 2014

@author: jeburks
'''
from osgeo import gdal,osr
from gdalconst import *
import ogr 
import geotifftools as gtt 
import sys
import TestClipper as tc
import ExtractValues as ex
import readgeodata as rdgeo

if __name__ == '__main__':
    pass

data_dir = "/Users/jeburks/work/data/SERVIR/chirps/2012/"

raster = "/Users/jeburks/work/data/SERVIR/chirps/2012/chirps.2012.01.01.tif"
raster2 = "/Users/jeburks/work/data/SERVIR/chirps/2012/chirps.2012.01.02.tif"
raster3 = "/Users/jeburks/work/data/SERVIR/chirps/2012/chirps.2012.01.03.tif"
raster4 = "/Users/jeburks/work/data/SERVIR/chirps/2012/chirps.2012.01.04.tif"
raster5 = "/Users/jeburks/work/data/SERVIR/chirps/2012/chirps.2012.01.05.tif"
outputFile = "/Users/jeburks/work/data/SERVIR/output.tif"




# Load the source data for the image
ds = gtt.openGeoTiff(raster)
# ##Open image to array
srcArray = gtt.readBandFromFile(ds,1)
srcImage = gdal.Open(raster)
geoTrans = ds.GetGeoTransform()   
    # 
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/kenya.geojson")
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/zaire.geojson")
ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/mypoly.geojson")
#ring = rdgeo.decodeGeoJSON("/Users/jeburks/work/data/SERVIR/gis/GeoJSON/mypoly2.geojson")
#ring = rdgeo.decodeShapefile("/Users/jeburks/work/data/SERVIR/gis/Country_shp/zaire.shp", "zaire")
print ring
mask = tc.rasterizePolygon(ds,ring)
print "done"

jan1 = ex.extractValue(mask, raster)
print "jan1"
jan2 = ex.extractValue(mask, raster2)
print "jan2"
jan3 = ex.extractValue(mask, raster3)
print "jan3"
jan4 = ex.extractValue(mask, raster4)
print "jan4"
jan5 = ex.extractValue(mask, raster5)
print "jan5"
sumTotal = jan1[0]+jan2[0]+jan3[0]+jan4[0]+jan5[0]
countTotal = jan1[1]+jan2[1]+jan3[1]+jan4[1]+jan5[1]
avgValue = sumTotal/countTotal
print "Avg =",avgValue







# dst_ds = gtt.createGeoTiff(outputFile, ds.RasterXSize, ds.RasterYSize, gdal.GDT_Float32,gtt.getSpatialRefOfImage(ds))
# dst_ds.SetGeoTransform(geoTrans)
# srs = osr.SpatialReference()
# srs.ImportFromEPSG(4326)
# dst_ds.SetProjection(srs.ExportToWkt())
# # 
# dst_ds.GetRasterBand(1).WriteArray( mask )
# dst_ds.FlushCache()
# dst_ds = None
