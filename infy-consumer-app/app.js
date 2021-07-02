var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var path = require("path");
var amqp = require("amqplib/callback_api");
var rabbitMQURL = process.env.RABBITMQURL ? "amqp://"+process.env.RABBITMQURL : "amqp://localhost";
var queueName = process.env.RABBITMQ_QUEUE || "infyMessageQueue";


app.use(bodyParser.json());

app.use('/client', express.static(__dirname + '/client'));



app.get("/consumer/api/receive-message", function (req, res) {
	console.log("inside consumer");
	try{
		amqp.connect(rabbitMQURL, (err, connection) => {
			if (err) {
				console.log(err);
				res.status(400).send({message : "Error while receiving connecting to RabbitMQ."});
			}
			else{
				connection.createChannel((err,channel)=>{
					if(err){
						console.log(err);
						res.status(400).send({message : "Error while receiving connecting to RabbitMQ channel."});
					}
					else{
					var messageString = "[]";
					channel.assertQueue(queueName, {
						durable : false
					});
					channel.consume(queueName,(mssg)=>{
						messageString = mssg.content.toString();
						
					});
		
					setTimeout(() => {
						channel.close();
						res.send({message : JSON.parse(messageString)});
					}, 1000);
					}
				})
			}

	})
	}catch(err){
		console.log(err);
		res.status(400).send({message : "Error while receiving the message"});
	}
})

app.get('/*', function (req, res) {
	res.sendFile(path.join(__dirname + '/client/modules/views/index.html'));
});

module.exports = app;
