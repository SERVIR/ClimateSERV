#  runDownloadNewClimateScenarioData.sh

#!/bin/sh
#####################################################################
#This script download new data		# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest
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

autoDate=$(date +'%Y')

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running IMERG download for Range, ${START_YYYYMMDD}, To, ${END_YYYYMMDD}"
python CHIRPS/utils/ftp/ftpIMERGDownloader.py ${START_YYYYMMDD} ${END_YYYYMMDD}
echo "Done running IMERG ftpIMERGDownloader"

echo "Running IMERG Ingest for Range, ${START_YYYYMMDD}, To, ${END_YYYYMMDD}"
python CHIRPS/utils/ingest/HDFIngestIMERGData.py ${START_YYYYMMDD} ${END_YYYYMMDD}
echo "Done running IMERG Ingest, HDFIngestIMERGData.py)"


