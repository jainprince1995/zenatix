var mqtt = require('mqtt')
var nodemailer = require('nodemailer');

const HUMID_EXD = 1; //humidity exceeded
const HUMID_NORM = 0; //humidity normal
const HUMID_MONITOR_TIME = 5;
const HUMID_THRESH = 80;


/*Basic queue implementation, just enqueue and dequeue for current requirement*/
class Queue 
{ 
    constructor() 
    { 
        this.items = []; 
    } 

    enqueue(element) 
    {     
        this.items.push(element); 
    } 
    
    dequeue() 
    { 
        if(this.isEmpty()) 
            return "Underflow"; 
        return this.items.shift(); 
    }
    
    isEmpty() 
    { 
        return this.items.length == 0; 
    }

    avg_humid_data_queue() {
        console.log(this.items.length);
        var avg = 0; 
            for(var i = 0; i < this.items.length; i++) { 
                console.log("item = "+this.items[i])
                avg += this.items[i];
            }
        return avg/this.items.length; 
    }

    empty_queue() {
        var len = this.items.length;
        for(var i = 0; i < len; i++) {
            console.log("removing")
            this.dequeue();
        }
    }   
} 
/*end: function needed to implement queue*/

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jainprince1995@gmail.com',
    pass: 'li#bullet350isaw53'
  }
});

var mailOptions = {
  from: 'jainprince1995@gmail.com',
  to: 'princejain@outlook.com',
};

function SEND_EMAIL() {
    return;
    var retry = 5;
    transporter.sendMail(mailOptions, function(error, info){
        while (retry--) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                return;
            }
        }
    });
};


var settings = {
    keepalive: 1,
    reconnectPeriod: 100 * 1
}
var client  = mqtt.connect('mqtt://test.mosquitto.org', settings)

var email_counter = 0;
var current_cond = HUMID_NORM; 
var avg_humid = 0;
let humid_data_queue = new Queue();

client.on('connect', function () {
    client.subscribe('sensor_data', function (err) {
        if (!err) {
            console.log("subscribed to get sensor data");
        } 
    })
})
 
client.on('message', function (topic, message) {
  if (topic == "sensor_data") {
      try {
          var json_message = JSON.parse(message)
          console.log("Humidity: "+json_message.humidity)
          console.log("Temperature: "+json_message.temperature)
         
          /*Initialize the data queue for first 5 data set*/ 
          if (humid_data_queue.items.length == HUMID_MONITOR_TIME) {
              humid_data_queue.dequeue();
          }

          humid_data_queue.enqueue(json_message.humidity);

          if (humid_data_queue.items.length < HUMID_MONITOR_TIME) {
              return;
          }

          var avg_humid = humid_data_queue.avg_humid_data_queue();
          console.log("avg: = "+ avg_humid)
           
          if (current_cond == HUMID_NORM) {
              if (avg_humid > HUMID_THRESH) {
                  email_counter = 1;
              } else {
                  email_counter = 0;
              }
          } else if (current_cond == 1) {
              if (avg_humid <= HUMID_THRESH) {
                  email_counter = 1;
              } else {
                  email_counter = 0;
              }
          }
          if (email_counter == 1) {
              if(current_cond == HUMID_NORM) {
                  //condition chnaged, temperature exceeded for more than 5 minutes
                  current_cond = HUMID_EXD;
                  console.log("exceeding");
                  mailOptions.subject = 'Sensor Data Alert | Humidity Exceeded';
                  mailOptions.text = 'ALERT: Humidity is exceeded in your Candy Factory.'+
                                     'Current Temperature: '+json_message.temperature+
                                     ' and Humidity: '+json_message.humidity;
                  SEND_EMAIL();
                  //empty the queue and re-monitor the humidity to get the average of 5 minutes
                  humid_data_queue.empty_queue();
              } else {
                  //condition chnaged, temperature back to normal for more than 5 minutes
                  current_cond = HUMID_NORM;
                  console.log("back to normal");
                  mailOptions.subject = 'Sensor Data Alert | Humidity Normal';
                  mailOptions.text = 'ALERT: Humidity is back to normal in your Candy Factory.'+
                                     'Current Temperature: '+json_message.temperature+
                                     ' and Humidity: '+json_message.humidity;
                  SEND_EMAIL();
                  //empty the queue and re-monitor the humidity to get the average of 5 minutes
                  humid_data_queue.empty_queue();
              }
              email_counter = 0;
          }
      }
      catch(e) {
          console.log(e);
          console.log("unexpected message or default message from broker");
      }
  } 
})
