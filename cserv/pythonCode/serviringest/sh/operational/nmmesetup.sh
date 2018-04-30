#  runDownloadNewClimateScenarioData.sh

#!/bin/sh
#####################################################################
#This script download new data			# OPERATIONAL
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/serviringest
if [ -z "$1" ]
  then
    echo "No Climate Model Ensemble Provided.  Expecting something such as, ens01 or ens02, etc"
    echo "Usage: ClimateModelEnsembleName ClimateModelVariable YYYYMM -Options(ALL/Single)"
    exit
fi
if [ -z "$2" ]
  then
    echo "No Climate Model Variable Provided.  Expecting something such as, tref, or prcp, etc"
    echo "Usage: ClimateModelEnsembleName ClimateModelVariable YYYYMM -Options(ALL/Single)"
    exit
fi
if [ -z "$3" ]
  then
    echo "No Climate Model Run YYYYMM String provided (Year and Month for the model run) .  Expecting something such as, 201508, or 201509, etc"
    echo "Usage: ClimateModelEnsembleName ClimateModelVariable YYYYMM -Options(ALL/Single)"
    exit
fi
if [ -z "$4" ]
  then
    echo "No options selected, Expecting, '-Single' or '-ALL'"
    echo "Usage: ClimateModelEnsembleName ClimateModelVariable YYYYMM -Options(ALL/Single)"
    exit
fi
CLIMATE_MODEL_ENSEMBLE=$1
CLIMATE_MODEL_VARIABLE=$2
CLIMATE_MODEL_RUN_YYYYMM=$3
CLIMATE_MODEL_OPTION=$4
#START_YEAR=$1
#END_YEAR=$2



cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running NMME setup, ${CLIMATE_MODEL_ENSEMBLE}, Variable, ${CLIMATE_MODEL_VARIABLE} and model run year month of ${CLIMATE_MODEL_RUN_YYYYMM} with option ${CLIMATE_MODEL_OPTION} set"
$python CHIRPS/utils/ftp/nmmesetup.py ${CLIMATE_MODEL_ENSEMBLE} ${CLIMATE_MODEL_VARIABLE} ${CLIMATE_MODEL_RUN_YYYYMM} ${CLIMATE_MODEL_OPTION}
echo "Done running Climate Change Scenario ftpClimateChangeScenarioDownloader"





