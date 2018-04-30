#  runDownloadIMERG2015ALLBackfill.sh

#!/bin/sh
#####################################################################
#This script download new data		# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/serviringest

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running IMERG download, extract, clean entire Legacy 2015 dataset Range is 20150307 to 20151231"
$python CHIRPS/utils/ftp/ftpIMERGDownload2015Data.py
echo "Done running IMERG ftpIMERGDownload2015Data"





