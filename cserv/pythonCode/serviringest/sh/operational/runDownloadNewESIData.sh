#!/bin/sh
#####################################################################
#This script download new data		# OPERATIONAL
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/serviringest
if [ -z "$1" ]
  then
    echo "No start Year provided"
    echo "Usage: startyear endyear"
    exit
fi
if [ -z "$2" ]
  then
    echo "No Ending year Provided"
    echo "Usage: startyear endyear"
    exit
fi
START_YEAR=$1
END_YEAR=$2

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running ESI Download from ${START_YEAR} to ${END_YEAR}"
$python CHIRPS/utils/ftp/ftpESIDownloader.py ${START_YEAR} ${END_YEAR}
echo "Done running ESI ftpESIGlobalDownloader"


