'''
Created on Feb 27, 2015
@author: jeburks

Modified starting from Sept 2015
@author: Kris Stanton
'''

import CHIRPS.utils.configuration.parameters as params
from os import listdir
from os import stat,remove
from os.path import isfile, join,splitext
import time
import CHIRPS.utils.db.bddbprocessing as bdd
import shutil

def fileAgeDays(pathname):
    return (time.time() - stat(pathname).st_mtime)/(86400.)

def deleteResultsFile(file):
    print "Deleting Results File ",file
    try:
        remove(file)
    except:
        print "--ERROR REMOVING FILE ", file
    
def deleteMaskFile(file):
    print "Deleting Mask File ",file
    try:
        remove(file)
    except:
        print "--ERROR REMOVING FILE ", file
    
def deleteDBEntry(item):
    print "Deleting database entry ",item
    try:
        bdp = bdd.BDDbConnector()
        bdp.deleteProgress(item)
        bdp.close()
    except:
        print "--ERROR REMOVING DATABASE ENTRY FOR ",item
    
# Delete Zip Files
def deleteZipFile(file):
    print "Deleting Zip File ",file
    try:
        remove(file)
    except:
        print "--ERROR REMOVING FILE ", file

# Delete scratch Folder that contains parts used to make zip files
def deleteScratchZipFolder(folder):
    print "Deleting scratch Zip Directory ",folder
    try:
        shutil.rmtree(folder)
    except:
        print "--ERROR REMOVING FOLDER ", folder
    
    
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

# Get only Zip Files from the storage location
def getListOfOldZipFiles():
    onlyfiles = [ f for f in listdir(params.zipFile_MediumTermStorage_Path) if (isfile(join(params.zipFile_MediumTermStorage_Path,f)) and f.endswith(".zip")) ]
    output = []
    for fileToProcess in onlyfiles:
        age = fileAgeDays(join(params.zipFile_MediumTermStorage_Path,fileToProcess))
        if (age >params.ageInDaysToPurgeData ):
            output.append(fileToProcess)
    return output

def runCleanup():
    print("Items older than "+str(params.ageInDaysToPurgeData)+" days will be removed")
    print "=============== NOW REMOVING OLD results texts, progress db entries and mask files ==============="
    oldfiles = getListOfOldFiles();
    for item in oldfiles:
        deleteResultsFile(join(params.resultsdir,item))
        deleteDBEntry(getBaseName(item))
        #deleteMaskFile(join(params.resultsdir,join(getBaseName(item),".npy")))
        deleteMaskFile(join(params.maskstorage,getBaseName(item) + ".hdf"))
    
    print "=============== NOW REMOVING OLD ZIPFILES and their scratch folders ==============="
    # Now deal with zip storage
    oldZipFiles = getListOfOldZipFiles()
    for zipItem in oldZipFiles:
        deleteZipFile(join(params.zipFile_MediumTermStorage_Path,zipItem))
        deleteScratchZipFolder(join(params.zipFile_ScratchWorkspace_Path, getBaseName(zipItem)))

    print "==== ALL DONE! ===="

if __name__ == '__main__':
    runCleanup()