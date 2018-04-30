#!/bin/sh
#####################################################################
#This script download new data		# OPERATIONAL
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest

autoDate=$(date +'%Y')

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}

echo "Running ESI Download from ${autoDate} to ${autoDate}"
python CHIRPS/utils/ftp/ftpESIDownloader.py ${autoDate} ${autoDate}
echo "Done running ESI ftpESIGlobalDownloader"
echo "Running ESI Ingest from ${autoDate} to ${autoDate}"
python CHIRPS/utils/ingest/HDFIngestESIData.py ${autoDate} ${autoDate}
echo "Done running ESI Ingest"

