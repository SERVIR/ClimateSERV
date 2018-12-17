#!/bin/sh
#####################################################################
#This Script cleans up the database and the results and mask directories.
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango

cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running Cleanup"
python CHIRPS/utils/cleanup/Cleanup.py
echo "Done running Cleanup"


