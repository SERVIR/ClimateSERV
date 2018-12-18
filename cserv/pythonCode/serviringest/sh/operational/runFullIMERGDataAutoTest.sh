#  runDownloadNewClimateScenarioData.sh

#!/bin/sh
#####################################################################
#This script download new data		# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest

autoDate=$(date +'%Y')
START_YYYYMMDD=$1
END_YYYYMMDD=$2
echo $1
echo $2
cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running IMERG download"
#python CHIRPS/utils/ftp/ftpIMERGDownloaderAutoTest.py
python CHIRPS/utils/ftp/ftpIMERGDownloaderAutoTest.py ${START_YYYYMMDD} ${END_YYYYMMDD}
echo "Done running IMERG ftpIMERGDownloaderAuto.py"

echo "Running IMERG Ingest"
#python CHIRPS/utils/ingest/HDFIngestIMERGDataAuto.py
python CHIRPS/utils/ingest/HDFIngestIMERGDataAutoTest.py ${START_YYYYMMDD} ${END_YYYYMMDD}
echo "Done running IMERG Ingest, HDFIngestIMERGDataAutoTest.py"





