'''
Created on Oct 2016
@author: BillyZ

'''
import urllib
import re
import os.path as path
import gzip
import os
import sys
import zipfile
import CHIRPS.utils.configuration.parameters as params


# USGS Path
roothttp ='https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/fews/web/asia/centralasia/dekadal/emodis/ndvi_c6/temporallysmoothedndvi/downloads/monthly/'

rootoutputdir = params.dataTypes[28]['inputDataLocation']

# Check the list of filenames and if their years are in the wrong place, return True,
def should_rename_files(year_from_zip, list_of_filenames):
    for current_filename in list_of_filenames:
        print 'current_filename: ' + current_filename
        parts = current_filename.split(".")
        ending = parts[-1]
        year = parts[0][-2:]
        part_to_compare = year #current_filename[5:7]
        # compre these strings, if they do NOT match.. then return True
        # Double cast here to remove extra zeros from the strings..
        try:
            if str(int(part_to_compare)) != str(int(year_from_zip)):
                 print("Detected a naming format the ingest procedure will not recognize.  An attempt will be made at renaming the files.")
                 return True
        except:
                 print("Detected a naming format the ingest procedure will not recognize.  An attempt will be made at renaming the files.")
                 return True
    return False

# Renames the files that are in the list. # switches ea1529.tif to ea2915.tif
def rename_files_to_new_format(folder_path_to_files, list_of_filenames):
    print("Attempting to rename files to match the new naming format.  This is so that the ingest will properly handle them.")
    for current_filename in list_of_filenames:
        if(len(current_filename) == 11):
              part_to_save_pre = current_filename[0:3]
              part_to_switch_1 = current_filename[3:5]
              part_to_switch_2 = current_filename[5:7]
              part_to_save_post = current_filename[7:11]
        else:
              part_to_save_pre = current_filename[0:3]
              part_to_switch_1 = current_filename[3:4]
              part_to_switch_2 = current_filename[4:6]
              part_to_save_post = current_filename[6:10]
        new_filename = part_to_save_pre + part_to_switch_2 + part_to_switch_1 + part_to_save_post
        fullpath_to_current_file = os.path.join(folder_path_to_files, current_filename)
        fullpath_to_new_filename = os.path.join(folder_path_to_files, new_filename)
        try:
            os.rename(fullpath_to_current_file, fullpath_to_new_filename)
        except:
            print("WARNING!!!!")
            print("  Failed to rename file: ")
            print("  " + str(fullpath_to_current_file))
            print("  to: ")
            print("  " + str(fullpath_to_new_filename))
            print("  To resolve this issue, rename this file manually or the ingest procedure will give very much unexpected results.")
    print("file rename procedures have finished.")


def removeTFWfiles(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".tfw") or filename.endswith(".zip"):
            #print "Removing "+directory+filename
            os.remove(directory+filename)

def removeTFWfilesForName(directory, name):
    for filename in os.listdir(directory):
        if filename.endswith(name + ".tfw") or filename.endswith(name + ".zip"):
            #print "Removing "+directory+filename
            os.remove(directory+filename)

def getFileForYearAndMonth(yearToGet,monthToGet):
    '''

    :param yearToGet:
    :param monthToGet:
    '''
    print "-------------------------------Working on ",monthToGet,"/",yearToGet,"------------------------------------"
    filenum = "{:0>2d}{:0>2d}".format(yearToGet-2000,monthToGet)
    year_from_zip = int(filenum[0:2])
    month_from_zip = int(filenum[2:4])
    url = roothttp+"cta"+filenum+'.zip'
    print url
    enddirectory =  rootoutputdir+str(yearToGet)+"/"
    endfilename = enddirectory+"cta"+filenum+'.zip'
    print endfilename
    print str(os.path.exists(endfilename) or filenum == '0103')
    if os.path.exists(endfilename):
       print "File already here " 
    else:
           urllib.urlretrieve (url, endfilename)
    list_of_filenames_inside_zipfile = []
    isRenameFiles = False
    with zipfile.ZipFile(endfilename, "r") as z:
        list_of_filenames_inside_zipfile = z.namelist()
        isRenameFiles = should_rename_files(year_from_zip, list_of_filenames_inside_zipfile)
        z.extractall(enddirectory)
    if isRenameFiles == True:
        rename_files_to_new_format(enddirectory, list_of_filenames_inside_zipfile)
    #removeTFWfiles(enddirectory)
    removeTFWfilesForName(enddirectory,"cta"+filenum) 
    print "EndFile ",endfilename

    print "-----------------------------Done working on ",monthToGet,"/",yearToGet,"---------------------------------"


def createEndDirectory(year):
    '''

    :param year:
    '''
    fullPath = rootoutputdir+str(year)
    if os.path.exists(fullPath) == False:
        print "Need to create "+fullPath
        os.makedirs(fullPath)
    else:
        print "Directory already exists "+fullPath



if __name__ == '__main__':
    print "Starting Downloading eMODIS Data for Central Asia"

    args = len(sys.argv)
    if (args < 3):
        print "Usage: Startyear endyear"
        sys.exit()
    else :
        print "Working on years ",sys.argv[1],"-",sys.argv[2]
        #####Go get range of years
        years = range(int(sys.argv[1]),int(sys.argv[2])+1)
        print years
        for year in years:
            createEndDirectory(year)
            for month in range(1,13):
                print "Processing Month:",month," Year ",year
                getFileForYearAndMonth(year,month)
        print "Done"
