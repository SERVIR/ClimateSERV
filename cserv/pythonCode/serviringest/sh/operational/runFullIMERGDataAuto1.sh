#  runDownloadNewClimateScenarioData.sh

#!/bin/sh
#####################################################################
#This script download new data		# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest

autoDate=$(date +'%Y')

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running IMERG download"
python CHIRPS/utils/ftp/ftpIMERGDownloaderAuto.py 
echo "Done running IMERG ftpIMERGDownloaderAuto.py"

echo "Running IMERG Ingest"
python CHIRPS/utils/ingest/HDFIngestIMERGDataAuto.py 
echo "Done running IMERG Ingest, HDFIngestIMERGDataAuto.py"





