#!/bin/bash
# Copies apache log files from the previous day to the ClimateSERV logs/apache directory
# Stores listings of task files in the /data/zipout/Zipfile_Storage and /data/zipout/Zipfile_Scratch directories
# Author: FD - 2018-12-20

# Fetching apache log files

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

# Generates listing for current day
DATESTAMP=$(date -I)
ls /data/data/zipout/Zipfile_Storage -l --time-style=long-iso -t > /data/data/logs/tasks/$DATESTAMP.tasks.log
ls /data/data/zipout/Zipfile_Scratch -l --time-style=long-iso -t >> /data/data/logs/tasks/$DATESTAMP.tasks.log
chmod a+r $DATESTAMP.tasks.log
