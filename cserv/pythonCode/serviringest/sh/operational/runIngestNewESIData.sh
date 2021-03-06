#!/bin/sh
#####################################################################
#This script ingests new data
#####################################################################

python="/usr/bin/python" #$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest

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
echo "Running ESI Ingest from ${START_YEAR} to ${END_YEAR}"
python CHIRPS/utils/ingest/HDFIngestESIData4wk.py ${START_YEAR} ${END_YEAR}
echo "Done running ESI Ingest"


