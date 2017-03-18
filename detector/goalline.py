#!/usr/bin/env python

from multiprocessing import Process
import sys
from time import sleep
import RPi.GPIO as GPIO          
import urllib2 
import json

GPIO.setmode(GPIO.BCM) 
INPUT_PIN = int(sys.argv[1])
OUTPUT_PIN = int(sys.argv[3])        
GPIO.setup(INPUT_PIN, GPIO.IN)
GPIO.setup(OUTPUT_PIN,GPIO.OUT)     

data = {
	'player': sys.argv[2]
}

print("Detecting goals for player " + sys.argv[2] + " from pin " + sys.argv[1])

def sendGoal():
	try:
		req = urllib2.Request('https://mw7qd5pah0.execute-api.us-east-1.amazonaws.com/dev/goal')
		req.add_header('Content-Type', 'application/json')		
		response = urllib2.urlopen(req, json.dumps(data))
		print(response.getcode())
	except:
		print("Got exception")

def sendPing():
	try:
		req = urllib2.Request('https://mw7qd5pah0.execute-api.us-east-1.amazonaws.com/dev/ping')
		req.add_header('Content-Type', 'application/json')
		response = urllib2.urlopen(req, json.dumps(data))
		print(response.getcode())
	except:
		print("Got exception")

def pingLoop():
	print("Ping running")
	while True:
		print("Ping")
		#sendGoal()
		sendPing()
		sleep(4)


def detectGoals():
	isSetUp = False
	loop = 0
	print("Goal detection starting")
	while True:
           if (GPIO.input(INPUT_PIN) == True):
		if(isSetUp == True):
			print("Goal!!")
			GPIO.output(OUTPUT_PIN,GPIO.HIGH)
			sendGoal()	
			isSetUp = False
			sleep(5)
			GPIO.output(OUTPUT_PIN,GPIO.LOW)
		else:
			#print("Not set up")
			sleep(1)
           else:
		if(isSetUp == False):
			isSetUp = True
			print("Detection set up")
		#print("0")
	  	sleep(0.001)
	

if __name__ == '__main__':
	p1 = Process(target=pingLoop)
	p1.start()
	p2 = Process(target=detectGoals)
	p2.start()
	p1.join()
	p2.join()
