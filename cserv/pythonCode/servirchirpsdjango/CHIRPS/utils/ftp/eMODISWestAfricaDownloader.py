'''
Created on Oct 6, 2014
@author: jeburks

Modified Sept 2016
@author: Kris Stanton (WinstonWolf359@gmail.com) - Cris Squared

'''
import urllib
import re
import os.path as path
import gzip
import os
import sys
import zipfile
import CHIRPS.utils.configuration.parameters as params

# Old USGS Path
#roothttp ='http://earlywarning.usgs.gov/ftp2/eMODIS/west/'
# New USGS Path
roothttp ='https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/fews/web/africa/west/dekadal/emodis/ndvi_c6/temporallysmoothedndvi/downloads/dekadal/'

rootoutputdir = params.dataTypes[1]['inputDataLocation']

# Check the list of filenames and if their years are in the wrong place, return True,
def should_rename_files(year_from_zip, list_of_filenames):
    for current_filename in list_of_filenames:
        part_to_compare = current_filename[4:6]
        # compre these strings, if they do NOT match.. then return True
        # Double cast here to remove extra zeros from the strings..
        if str(int(part_to_compare)) != str(int(year_from_zip)):
            print("Detected a naming format the ingest procedure will not recognize.  An attempt will be made at renaming the files.")
            return True
    return False

# Renames the files that are in the list. # switches ea1529.tif to ea2915.tif
def rename_files_to_new_format(folder_path_to_files, list_of_filenames):
    print("Attempting to rename files to match the new naming format.  This is so that the ingest will properly handle them.")
    for current_filename in list_of_filenames:
        part_to_save_pre = current_filename[0:2]
        part_to_switch_1 = current_filename[2:4]
        part_to_switch_2 = current_filename[4:6]
        part_to_save_post = current_filename[-4:]
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

def getFileForYearAndDekadal(yearToGet,dekadalToGet):
    '''

    :param yearToGet:
    :param monthToGet:
    '''
    print "-------------------------------Working on ",dekadalToGet,"/",yearToGet,"------------------------------------"
    filenum = "{:0>2d}{:0>2d}".format(yearToGet-2000,dekadalToGet)
    revfilenum = "{:0>2d}{:0>2d}".format(dekadalToGet,yearToGet-2000)
    year_from_zip = int(filenum[0:2])
    dekad_from_zip = int(filenum[2:4])
    url = roothttp+"wa"+filenum+'.zip'
    print url
    enddirectory =  rootoutputdir+str(yearToGet)+"/"
    endfilename = enddirectory+"wa"+filenum+'.zip'
    revEndfilename = enddirectory+"wa"+revfilenum+'.tif'
    print endfilename
    print str(os.path.exists(endfilename) or filenum == '0103')
    if (os.path.exists(endfilename.replace(".zip", ".tif"))) or (os.path.exists(revEndfilename)):
		print "File already here " 
    else:
		try:
			urllib.urlretrieve (url, endfilename)
			list_of_filenames_inside_zipfile = []
			isRenameFiles = False
			with zipfile.ZipFile(endfilename, "r") as z:
				list_of_filenames_inside_zipfile = z.namelist()
				isRenameFiles = should_rename_files(year_from_zip, list_of_filenames_inside_zipfile)
				z.extractall(enddirectory)
			if isRenameFiles == True:
				rename_files_to_new_format(enddirectory, list_of_filenames_inside_zipfile)
			removeTFWfiles(enddirectory)
			print "EndFile ",endfilename
		except:
			os.remove(endfilename)
    print "-----------------------------Done working on ",dekadalToGet,"/",yearToGet,"---------------------------------"
	
def getFileForYearAndMonth(yearToGet,monthToGet):
    '''

    :param yearToGet:
    :param monthToGet:
    '''
    print "-------------------------------Working on ",monthToGet,"/",yearToGet,"------------------------------------"
    filenum = "{:0>2d}{:0>2d}".format(yearToGet-2000,monthToGet)
    year_from_zip = int(filenum[0:2])
    month_from_zip = int(filenum[2:4])
    url = roothttp+"wa"+filenum+'.zip'
    print url
    enddirectory =  rootoutputdir+str(yearToGet)+"/"
    endfilename = enddirectory+"west"+filenum+'.zip'
    print endfilename
    try:
        urllib.urlretrieve (url, endfilename)
        list_of_filenames_inside_zipfile = []
        isRenameFiles = False
        with zipfile.ZipFile(endfilename, "r") as z:
            list_of_filenames_inside_zipfile = z.namelist()
            isRenameFiles = should_rename_files(year_from_zip, list_of_filenames_inside_zipfile)
            z.extractall(enddirectory)
        if isRenameFiles == True:
            rename_files_to_new_format(enddirectory, list_of_filenames_inside_zipfile)
        removeTFWfiles(enddirectory)
        print "EndFile ",endfilename
    except:
        os.remove(endfilename)
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
    print "Starting Downloading eMODIS Data for West Africa"

    # DONE!  (by Kris Stanton (WinstonWolf359, Cris Squared - 2016) # print "TODO! FIX FILE NAME ISSUE WITH EMODIS (USGS reversed the numbers for year and itemNumber in the tif file names.  ONCE THIS HAS BEEN MITIGATED, REMOVE THIS MESSAGE!"

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
            for dekadal in range(1,13):
                print "Processing dekadal:",dekadal," Year ",year
                getFileForYearAndDekadal(year,dekadal)
        print "Done"
