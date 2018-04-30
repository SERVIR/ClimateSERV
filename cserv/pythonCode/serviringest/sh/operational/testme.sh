#  testme.py

#!/bin/sh
#####################################################################
#This script download new data			# OPERATIONAL
#####################################################################

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/serviringest


cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}
echo "Running test"
$python CHIRPS/utils/ingest/testme.py
echo "Done running test"


