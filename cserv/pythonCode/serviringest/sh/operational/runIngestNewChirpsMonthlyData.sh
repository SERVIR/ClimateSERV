#  runIngestNewChirpsMonthlyData.sh

#!/bin/sh
#####################################################################
#This script ingests new data				# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/serviringest
if [ -z "$1" ]
  then
    echo "No Start Date Provided.  Expecting YYYYMM"
    echo "Usage: StartYYYYMM EndYYYYMM"
    exit
fi
if [ -z "$2" ]
  then
    echo "No End Date Provided.  Expecting YYYYMM"
    echo "Usage: StartYYYYMM EndYYYYMM"
    exit
fi

START_YYYYMM=$1
END_YYYYMM=$2



cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running Chirps Monthly Ingest Ingest for Range, ${START_YYYYMM}, To, ${END_YYYYMM}"
$python CHIRPS/utils/ingest/HDFIngestChirpsMonthlyData.py ${START_YYYYMM} ${END_YYYYMM}
echo "Done running Chirps Monthly data Ingest, HDFIngestChirpsMonthlyData.py)"


