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
#START_YEAR='2001'
#autoDate='2018'
cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running West Africa NDVI Download from ${autoDate} to ${autoDate}"
python CHIRPS/utils/ftp/eMODISWestAfricaDownloader.py ${autoDate} ${autoDate}
echo "Done running Chirps eMODISWestAfricaDownloader"
python CHIRPS/utils/ingest/HDFIngestMODISNDVIData.py ${autoDate} ${autoDate}
echo "Done running eMODIS NDVI West Africa Ingest"

