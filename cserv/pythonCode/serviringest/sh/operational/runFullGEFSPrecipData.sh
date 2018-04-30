#!/bin/sh
#####################################################################
#This script download new data		# OPERATIONAL
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

autoDate=1995 #$(date +'%Y')
autoDateE=1995

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running Chirps Download from ${autoDate} to ${autoDateE}"
python CHIRPS/utils/ftp/ftpCHIRPSGEFSPrecipDownloader.py ${autoDate} ${autoDateE}
echo "Done running Chirps ftpCHIRPSGlobalDownloader"
echo "Running Chirps Ingest from ${autoDate} to ${autoDateE}"
python CHIRPS/utils/ingest/HDFIngestChirpsGEFSPrecipData.py ${autoDate} ${autoDateE}


