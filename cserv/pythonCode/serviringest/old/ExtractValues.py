'''
Created on Jan 23, 2014

@author: jeburks
'''
import geotiffreader as gtr
import numpy as np





def extractValue(maskarray,filetoprocess):
    #print "here"
    ds = gtr.openGeoTiff(filetoprocess)
    array = gtr.readBandFromFile(ds,1)
    masked = np.ma.masked_array(array, mask=np.logical_not(maskarray), fill=-9999)
    newarray = masked != -9999
    sumvalue = float(masked[newarray].sum())
    count = float(newarray.count())
    avg = sumvalue/count
    #print "sum =",sumvalue," count=",count, "avg=",avg
    return [sumvalue,count]
    
    
#def getEndMask(maskarray,filetoprocess):