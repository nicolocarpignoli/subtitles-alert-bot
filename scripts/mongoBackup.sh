#!/bin/sh
DIR=`date +%m%d%y`
DEST=../../subtitlesAlertBotMongo_backups/$DIR
mkdir $DEST
mongodump -h localhost -d subtitlesAlertBot -u pi -p mango932cortisone -o $DEST
