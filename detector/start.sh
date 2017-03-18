#!/bin/bash

PIN=$1
PLAYER=$2 
OUT=$3

nohup python goalline.py $PIN $PLAYER $OUT > player_$PLAYER.out &
