#  nmmeAuto.sh

#!/bin/sh
#####################################################################
#This script download new data		# Operational Version
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest

if [ -z "$1" ]
  then
    echo "Please send yyyy"
    exit
fi
if [ -z "$2" ]
  then
    echo "Please send MM"
    exit
fi

year=$1 
month=$2
ens01="ens01"
precip="prcp"
all="-ALL"
yearmonth=$year$month
cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running NMME Setup"
python CHIRPS/utils/ftp/nmmesetup.py ${year} ${month} ${ens01} ${precip} ${all}
echo "Done running IMERG nmmesetup.py"


echo "Running Climate Change Scenario download for Ensemble, ${ens01}, Variable, ${precip} and model run year month of ${yearmonth} with option ${all} set"
python CHIRPS/utils/ftp/ftpClimateChangeScenarioDownloader.py ${ens01} ${precip} ${yearmonth} ${all}

echo "Running Climate Change Scenario ingest for Ensemble, ${ens01}, Variable, ${precip} and model run year month of ${yearmonth} with option ${all} set"
python CHIRPS/utils/ingest/HDFIngestClimateChangeScenarioData.py ${ens01} ${precip} ${yearmonth} ${all}








