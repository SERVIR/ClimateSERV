#!/bin/sh

HEADWORKERS=3
WORKERSPERHEAD=8

python=$(python -c "import os; print(os.environ['_'])")
rootdir=/data/data/cserv/pythonCode/servirchirpsdjango #/data/data/cserv/pythonCode/serviringest
BASEIPCDIR="ipc:///tmp/servir/"
MAINQUEUEINPUT=${BASEIPCDIR}Q1/input
MAINQUEUEOUTPUT=${BASEIPCDIR}Q1/output
PIDNAME=/tmp/servir/pid
cd ${rootdir}
export PYTHONPATH=${PYTHONPATH}:${rootdir}

launch() {
	echo 'python: ' + $python
	python CHIRPS/utils/db/bddbprocessing.py
	python CHIRPS/utils/file/fileutils.py /tmp/servir/Q1 input
	
	python CHIRPS/utils/file/fileutils.py /tmp/servir/Q1 output
	
	echo "starting the Head Workers"
	##################Start Input Queue########################################
	python CHIRPS/processing/zmqconnected/ArgProxyQueue.py ${MAINQUEUEINPUT} ${MAINQUEUEOUTPUT} &
	echo $! > ${PIDNAME}
	
	##################Start Head Workers and subordinate workers###############
	for i in  $(seq 1 $HEADWORKERS);
	do
		echo 'starting Head Processer'$i
		
		HEADNAME=HEAD${i}
		echo "Starting Head Worker Named:" $HEADNAME
		python CHIRPS/utils/file/fileutils.py /tmp/servir/${HEADNAME} q1in
		python CHIRPS/utils/file/fileutils.py /tmp/servir/${HEADNAME} q1out
		python CHIRPS/utils/file/fileutils.py /tmp/servir/${HEADNAME} q2in
		python CHIRPS/utils/file/fileutils.py /tmp/servir/${HEADNAME} q2out
		HEADQUEUEONEINPUT=${BASEIPCDIR}${HEADNAME}'/q1in'
		HEADQUEUEONEOUTPUT=${BASEIPCDIR}${HEADNAME}'/q1out'
		HEADQUEUETWOINPUT=${BASEIPCDIR}${HEADNAME}'/q2in'
		HEADQUEUETWOOUTPUT=${BASEIPCDIR}${HEADNAME}'/q2out'
		python CHIRPS/processing/zmqconnected/ZMQCHIRPSHeadProcessor.py ${HEADNAME} ${MAINQUEUEOUTPUT} ${HEADQUEUEONEINPUT} ${HEADQUEUETWOOUTPUT} &
		echo $! >> ${PIDNAME}
		python CHIRPS/processing/zmqconnected/ArgProxyQueue.py ${HEADQUEUEONEINPUT} ${HEADQUEUEONEOUTPUT} &
		value=$!
		echo ${value} >> ${PIDNAME}
		for  j in $(seq 1 $WORKERSPERHEAD);
		do
			WORKERNAME=W${j}${HEADNAME}
			echo "Starting Worker: $WORKERNAME"
			python CHIRPS/processing/zmqconnected/ZMQCHIRPSDataWorker.py ${WORKERNAME} ${HEADQUEUEONEOUTPUT} ${HEADQUEUETWOINPUT}  &
			echo $! >> ${PIDNAME}
		done
		python CHIRPS/processing/zmqconnected/ArgProxyQueue.py ${HEADQUEUETWOINPUT} ${HEADQUEUETWOOUTPUT} &
		echo $! >> ${PIDNAME}
		
	done
	python CHIRPS/utils/file/filePermissions.py /tmp/servir/Q1/input
}

start() {
	if [ -f $PIDNAME ] && kill -0 $(cat $PIDNAME); then
    	echo 'Service already running' >&2
    	return 1
  	fi
  	echo 'Starting service' >&2
	launch	
  	echo 'Service started' >&2
}

stop() {
	if [ ! -f "$PIDNAME" ] || ! kill -0 $(cat "$PIDNAME"); then
    	echo 'Service not running' >&2
    	return 1
  	fi
  	echo 'Stopping service' >&2
  	kill -15 $(cat "$PIDNAME") && rm -f "$PIDNAME"
 	 echo 'Service stopped' >&2
}



case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
esac
