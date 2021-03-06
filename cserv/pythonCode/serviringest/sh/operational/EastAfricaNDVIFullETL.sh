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
#autoDate='2005'
#END_YEAR='2017'

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running East Africa NDVI Download from ${autoDate} to ${autoDate}"
python CHIRPS/utils/ftp/eMODISEastAfricaDownloader.py ${autoDate} ${autoDate}
echo "Done running Chirps eMODISEastAfricaDownloader"
echo "Running eMODIS NDVI East Africa Ingest from ${autoDate} to ${autoDate}"
python CHIRPS/utils/ingest/HDFIngestMODISNDVIDataEastAfrica.py ${autoDate} ${autoDate}
echo "Done running eMODIS NDVI East Africa Ingest"
