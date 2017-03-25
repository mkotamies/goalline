#!/bin/bash

PIN=$1
PLAYER=$2 
OUT=$3

/usr/bin/nohup /usr/bin/python /home/pi/goalline/goalline.py $PIN $PLAYER $OUT > /tmp/player_$PLAYER.out &
