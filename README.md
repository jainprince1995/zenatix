# zenatix
Humidity and temperature alert system

This alert system works on pub/sub model.

#############################################################################
Publisher: dht_simulator.py

Description: This script will publish humidity and temperature data from DHT simulator sensor
Humidity and temperature can be simulated within given range, see options below:
Usage: <-hum>  <"min humidity">  <"max humidity">  <-temp>  <"min temp.">  <"max temp.">

This Script is a publisher, which publish the simulated dht sensor data to the MQTT broker. Broker send the sensor data to all the subscriber, who subscribed to 'sensor_data' topic to get the sensor data. 
##############################################################################


##############################################################################
alert_sysytem.js

Description:
Now the subscriber will send the mail if the average humidity exceeds the threshold value for more than 5 minutes and send mail if humidity come back to normal. Average humidity need to be remained normal for 5 minutes in order to send mail.

Mail will be sent only once if humidity exceed the threshold, it wait for the humidity to come back to normal. As soon as humidity come back to normal, a alert mail will be sent. If the humidity keep exceeding the threshold then repeated email will not be sent.
##############################################################################
