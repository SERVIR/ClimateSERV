#!/bin/sh
#####################################################################
#This script download new data		# OPERATIONAL
#####################################################################

python=$(python -c "import sys; print(sys.executable)")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango 

autoDate="2019" #$(date +'%Y')
autoDateE="2019" #$(date +'%Y') #2005

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running Chirps Download from ${autoDate} to ${autoDateE}"
python CHIRPS/utils/ftp/ftpCHIRPSGEFS75Downloader.py #${autoDate} ${autoDateE}
echo "Done running Chirps ftpCHIRPSGlobalDownloader"
echo "Running Chirps Ingest from ${autoDate} to ${autoDateE}"
python CHIRPS/utils/ingest/HDFIngestChirpsGEFS75Data.py #${autoDate} ${autoDateE}
echo "Ingest from ${autoDate} to ${autoDateE} complete"


