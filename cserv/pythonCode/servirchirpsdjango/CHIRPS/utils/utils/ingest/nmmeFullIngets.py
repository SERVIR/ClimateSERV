#!/usr/bin/python

import sys
import os
import shutil
import glob
import subprocess
def copytree(src, dst, symlinks=False, ignore=None):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks, ignore)
        else:
            shutil.copy2(s, d)
            
if(len(sys.argv)>2):
    print("Please enter in a proper format...")
else:
    path='/data/data/cserv/nmmeInputTemp/'
    if os.path.exists(path+str(sys.argv[1])):
        shutil.rmtree(path+str(sys.argv[1]))
        os.makedirs(path+str(sys.argv[1]))
        print("Folder created...")
    else:
        os.makedirs(path+str(sys.argv[1]))
        print("Folder created...")
    os.makedirs(path+str(sys.argv[1])+'/ens01')
    os.makedirs(path+str(sys.argv[1])+'/ens02')
    os.makedirs(path+str(sys.argv[1])+'/ens03')
    os.makedirs(path+str(sys.argv[1])+'/ens04')
    os.makedirs(path+str(sys.argv[1])+'/ens05')
    os.makedirs(path+str(sys.argv[1])+'/ens06')
    os.makedirs(path+str(sys.argv[1])+'/ens07')
    os.makedirs(path+str(sys.argv[1])+'/ens08')
    os.makedirs(path+str(sys.argv[1])+'/ens09')
    os.makedirs(path+str(sys.argv[1])+'/ens10')
    print("Ensambles folders created...")
    ensPath='/data/nmmenew/GEOOUT_ALL/'+str(sys.argv[1])
    copytree(ensPath+'/ens015/', path+str(sys.argv[1])+'/ens01')
    copytree(ensPath+'/ens025/', path+str(sys.argv[1])+'/ens02')
    copytree(ensPath+'/ens035/', path+str(sys.argv[1])+'/ens03')
    copytree(ensPath+'/ens045/', path+str(sys.argv[1])+'/ens04')
    copytree(ensPath+'/ens055/', path+str(sys.argv[1])+'/ens05')
    copytree(ensPath+'/ens065/', path+str(sys.argv[1])+'/ens06')
    copytree(ensPath+'/ens075/', path+str(sys.argv[1])+'/ens07')
    copytree(ensPath+'/ens085/', path+str(sys.argv[1])+'/ens08')
    copytree(ensPath+'/ens095/', path+str(sys.argv[1])+'/ens09')
    copytree(ensPath+'/ens105/', path+str(sys.argv[1])+'/ens10')
    print("Mapped ensambles to appropriate folder...")
    os.chdir(path+str(sys.argv[1])+'/ens01')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e01.tif')    
    os.chdir(path+str(sys.argv[1])+'/ens02')

    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e02.tif')    
    os.chdir(path+str(sys.argv[1])+'/ens03')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e03.tif')   
    os.chdir(path+str(sys.argv[1])+'/ens04')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e04.tif')   
    os.chdir(path+str(sys.argv[1])+'/ens05')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e05.tif')  
    os.chdir(path+str(sys.argv[1])+'/ens06')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e06.tif')   
    os.chdir(path+str(sys.argv[1])+'/ens07')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e07.tif')   
    os.chdir(path+str(sys.argv[1])+'/ens08')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e08.tif')   
    os.chdir(path+str(sys.argv[1])+'/ens09')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e09.tif')   
    os.chdir(path+str(sys.argv[1])+'/ens10')
    for afile in os.listdir('.'):
        filename, file_extension = os.path.splitext(afile)
        if file_extension == '.tif':
            os.rename('e015.tif', 'e10.tif')   
            
    print("Renamed all the tif files...")
    os.chdir('/data/data/image/input/nmme')    
    for filename in glob.glob("ens*"):
        os.rmdir(filename)    
    print("Cleaned last input folder...")
    os.chdir('/data/data/cserv/pythonCode/serviringest/sh/operational')    
    subprocess.Popen('runDownloadNewClimateScenarioData.sh ens01 prcp '+str(sys.argv[1])+' -ALL', shell=True) 
    print("Done with ingest..")
    subprocess.Popen('runIngestNewClimateScenarioData.sh ens01 prcp '+str(sys.argv[1])+' -ALL', shell=True) 
    print("Done with download...")
    
