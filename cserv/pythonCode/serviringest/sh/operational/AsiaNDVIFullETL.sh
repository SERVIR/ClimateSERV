#!/bin/sh
#####################################################################
#This script download new data
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest
#if [ -z "$1" ]
#  then
#    echo "No start Year provided"
#    echo "Usage: startyear endyear"
#    exit
#fi
#if [ -z "$2" ]
#  then
#    echo "No Ending year Provided"
#    echo "Usage: startyear endyear"
#    exit
#fi
#START_YEAR=$1
#END_YEAR=$2
autoDate=$(date +'%Y')
#autoDate='2018'
START_YEAR=${autoDate}
END_YEAR=${autoDate}

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running South Africa NDVI Download from ${START_YEAR} to ${END_YEAR}"
python CHIRPS/utils/ftp/eMODIScentralasiaDownloader.py ${START_YEAR} ${END_YEAR}
echo "Done running Chirps eMODIScentralasiaDownloader"
echo "Running eMODIS NDVI South Africa Ingest from ${START_YEAR} to ${END_YEAR}"
python CHIRPS/utils/ingest/HDFIngestMODISNDVIDataAsia.py ${START_YEAR} ${END_YEAR}
echo "Done running eMODIS NDVI South Africa Ingest"