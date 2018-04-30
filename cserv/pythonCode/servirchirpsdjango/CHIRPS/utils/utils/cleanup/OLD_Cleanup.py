'''
Created on Feb 27, 2015

@author: jeburks
'''

import CHIRPS.utils.configuration.parameters as params
from os import listdir
from os import stat,remove
from os.path import isfile, join,splitext
import time
import CHIRPS.utils.db.bddbprocessing as bdd

def fileAgeDays(pathname):
    return (time.time() - stat(pathname).st_mtime)/(86400.)

def deleteResultsFile(file):
    print "Deleting Results File ",file
    remove(file)
    
def deleteMaskFile(file):
    print "Deleting Mask File ",file
    remove(file)
    
def deleteDBEntry(item):
    print "Deleting database entry ",item
    bdp = bdd.BDDbConnector()
    bdp.deleteProgress(item)
    bdp.close()
    
def getBaseName(fileToProcess):
    fileName, fileExtension = splitext(fileToProcess)
    return fileName
    
def getListOfOldFiles():
    ##params.resultsdir
    onlyfiles = [ f for f in listdir(params.resultsdir) if (isfile(join(params.resultsdir,f)) and f.endswith(".txt")) ]
    output = []
    for fileToProcess in onlyfiles:
        age = fileAgeDays(join(params.resultsdir,fileToProcess))
        if (age >params.ageInDaysToPurgeData ):
            output.append(fileToProcess)
    return output

def runCleanup():
    oldfiles = getListOfOldFiles();
    for item in oldfiles:
        deleteResultsFile(join(params.resultsdir,item))
        deleteDBEntry(getBaseName(item))
        deleteMaskFile(join(params.resultsdir,join(getBaseName(item),".npy")))
    
    


if __name__ == '__main__':
    runCleanup()