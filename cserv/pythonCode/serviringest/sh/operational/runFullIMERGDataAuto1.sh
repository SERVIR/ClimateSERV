#  runDownloadNewClimateScenarioData.sh

#!/bin/sh
#####################################################################
#This script download new data		# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest

autoDate=$(date +'%Y')
START_YYYYMMDD=autoDate
END_YYYYMMDD=autoDate

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running IMERG download"
#python CHIRPS/utils/ftp/ftpIMERGDownloaderAuto.py 
python CHIRPS/utils/ftp/ftpIMERGDownloaderAuto.py ${START_YYYYMMDD} ${END_YYYYMMDD}
echo "Done running IMERG ftpIMERGDownloaderAuto.py"

echo "Running IMERG Ingest"
#python CHIRPS/utils/ingest/HDFIngestIMERGDataAuto.py 
python CHIRPS/utils/ingest/HDFIngestIMERGDataAuto.py ${START_YYYYMMDD} ${END_YYYYMMDD}
echo "Done running IMERG Ingest, HDFIngestIMERGDataAuto.py"





