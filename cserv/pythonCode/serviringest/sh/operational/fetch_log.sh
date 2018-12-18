#!/bin/bash
# Copies apache log files from the previous day to the ClimateSERV logs/apache directory
# Author: FD - 2018-12-18
LOGDIR="/data/data/logs/apache"
DATESTAMP=$(date -d '-1 days' -I)
ACCESSFILE="$LOGDIR/$DATESTAMP.access.log"
ERRORFILE="$LOGDIR/$DATESTAMP.error.log"
OTHERFILE="$LOGDIR/$DATESTAMP.other_vhosts_access.log"
cp /var/log/apache2/access.log.1 $ACCESSFILE
cp /var/log/apache2/error.log.1 $ERRORFILE
cp /var/log/apache2/other_vhosts_access.log.1 $OTHERFILE
chmod a+r $ACCESSFILE
chmod a+r $ERRORFILE
chmod a+r $OTHERFILE

