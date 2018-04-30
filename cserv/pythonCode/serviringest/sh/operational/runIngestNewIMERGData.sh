#  runIngestNewIMERGData.sh

#!/bin/sh
#####################################################################
#This script ingests new data				# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/serviringest
if [ -z "$1" ]
  then
    echo "No Start Date Provided.  Expecting YYYYMMDD"
    echo "Usage: StartYYYYMMDD EndYYYYMMDD"
    exit
fi
if [ -z "$2" ]
  then
    echo "No End Date Provided.  Expecting YYYYMMDD"
    echo "Usage: StartYYYYMMDD EndYYYYMMDD"
    exit
fi

START_YYYYMMDD=$1
END_YYYYMMDD=$2



cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running IMERG Ingest for Range, ${START_YYYYMMDD}, To, ${END_YYYYMMDD}"
$python CHIRPS/utils/ingest/HDFIngestIMERGData.py ${START_YYYYMMDD} ${END_YYYYMMDD}
echo "Done running IMERG Ingest, HDFIngestIMERGData.py)"


