#!/bin/bash
LOGFILE="$(pwd)/gunshot_cronjob.log"
PROJECT_PATH="/Users/risabhrizz/Code/Projects/phoenix-pd-gunshot-detection/raspberry_pi/"
# PROJECT_PATH="~/Code/phoenix-pd-gunshot-detection/raspberry_pi/"

if [[ ! -d $PROJECT_PATH ]]; then
    echo -e "$(date):: Project Path Incorrect: $PROJECT_PATH" >> $LOGFILE
    echo -e "$(date):: Exiting..." >> $LOGFILE
    exit 1
fi

echo -e "$(date):: Entering startup scripts directory" >> $LOGFILE
cd $PROJECT_PATH
echo -e "$(date):: Current directory: $(pwd)" >> $LOGFILE


if [[ ! -f "./backups/gunshot_detection.py" ]]; then
    echo -e "$(date):: There is no './backups/gunshot_detection.py' file inside 'raspberry_pi' directory." >> $LOGFILE
else 
    if [[ "$(md5sum gunshot_detection.py | awk '{ print $1 }')" = "$(md5sum backups/gunshot_detection.py | awk '{ print $1 }')" ]]; then
        echo -e "$(date):: CHECKSUM VERIFIED!! Executing gunshot script." >> $LOGFILE
    else 
        echo -e "$(date):: xxxxx INCORRECT CHECKSUM!! Gunshot python-script corrupted. Copying backup script." >> $LOGFILE
        mv gunshot_detection.py corrupt_gunshot_detection_$(date +%d_%m_%Y_%H:%M).py
        cp backups/gunshot_detection.py .
    fi
fi

echo -e "$(date):: +++ Executing Gunshot detection python script +++" >> $LOGFILE
# nohup python3 gunshot_detection.py &

echo -e "$(date):: === Gunshot Script Executed ===" >> $LOGFILE