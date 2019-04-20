import paho.mqtt.client as mqtt
import time
import json
import sys
import random

def is_intstring(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

if len(sys.argv) != 7 and len(sys.argv) != 2:
    print "-h: for help"
    sys.exit (1)

if sys.argv[1] == '-h':
    print "This script will publish humidity and temperature data from DHT simulator sensor"
    print "Humidity and temperature can be simulated within given range, see options below:"
    print "Usage: <-hum> <\"min humidity\"> <\"max humidity\"> <-temp> <\"min temp.\"> <\"max temp.\">"
    sys.exit (1)
elif sys.argv[1] != "-hum" or sys.argv[4] != "-temp":
    print "-h: for help"
    sys.exit (1)
elif not is_intstring(sys.argv[2])\
     or not is_intstring(sys.argv[3])\
     or not is_intstring(sys.argv[5])\
     or not is_intstring(sys.argv[6]):
        sys.exit("All min. max. arguments must be integers. Exit.")
else:
    min_hum = int(sys.argv[2])
    max_hum = int(sys.argv[3])
    min_temp = int(sys.argv[5])
    max_temp = int(sys.argv[6])
    
if min_hum > max_hum or min_temp > max_temp:
    sys.exit("min. can't be greater than max. arguments. Exit.")

MQTT_HOST = "test.mosquitto.org"
MQTT_PORT = 1883
MQTT_KEEPALIVE_INTERVAL = 45
MQTT_TOPIC = "sensor_data"

# callback of publish event
def publish_cb(client, userdata, mid):
    print "Message Published..."

#callback of connect event
def connect_cb(client, userdata, flags, rc):
    if not rc:
        print("connected with mqtt brocker")
    else:
        print("failed to connect with broker")
        sys.exit (1)

def read_DHT():
    return random.randint(min_hum, max_hum), random.randint(min_temp, max_temp)
    

# Initiate MQTT Client
mqtt_client = mqtt.Client()

# Register publish and connect callback function
mqtt_client.on_publish = publish_cb
mqtt_client.on_connect = connect_cb

# Connect with MQTT Broker
mqtt_client.connect(MQTT_HOST)

#initial sleep for 2 seconds after connecting with broker
time.sleep(2)


while True:
    hum, temp = read_DHT()
    DHT_sensor_data = {"humidity": hum, "temperature": temp}
    MQTT_MSG = json.dumps(DHT_sensor_data);
    mqtt_client.publish(MQTT_TOPIC,MQTT_MSG)#publish
    time.sleep(2)# sleep for 60 seconds before publishing next reading
