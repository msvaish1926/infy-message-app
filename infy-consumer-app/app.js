var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var path = require("path");
var amqp = require("amqplib/callback_api");
var rabbitMQURL = process.env.RABBITMQURL || "amqp://localhost";


app.use(bodyParser.json());

app.use('/client', express.static(__dirname + '/client'));



app.get("/consumer/api/receive-message", function (req, res) {
	console.log("inside consumer");
	try{
		amqp.connect(rabbitMQURL, (err, connection) => {
		if (err) {
			throw err
		}
		connection.createChannel((err,channel)=>{
			if(err){
				throw err;
			}
			let queueName = "publisherQueue";
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
		})

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