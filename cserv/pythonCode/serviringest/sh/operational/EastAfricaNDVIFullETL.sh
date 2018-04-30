#!/bin/sh
#####################################################################
#This script download new data
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/serviringest

autoDate=$(date +'%Y')

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running East Africa NDVI Download from ${autoDate} to ${autoDate}"
$python CHIRPS/utils/ftp/eMODISEastAfricaDownloader.py ${autoDate} ${autoDate}
echo "Done running Chirps eMODISEastAfricaDownloader"
echo "Running eMODIS NDVI East Africa Ingest from ${autoDate} to ${autoDate}"
$python CHIRPS/utils/ingest/HDFIngestMODISNDVIDataEastAfrica.py ${autoDate} ${autoDate}
echo "Done running eMODIS NDVI East Africa Ingest"
