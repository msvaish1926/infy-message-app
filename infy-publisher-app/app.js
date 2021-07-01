var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var path = require("path");
var fileupload = require("express-fileupload");
var amqp = require("amqplib/callback_api");
var uuid = require("uuid");
var randomColor = require("randomcolor");
var rabbitMQURL = process.env.RABBITMQURL ? "amqp://"+process.env.RABBITMQURL : "amqp://localhost";
app.use(bodyParser.json());
app.use(fileupload());

app.use('/client', express.static(__dirname + '/client'));



app.post("/publisher/api/send-message", function (req, res) {
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
			let messagJson = JSON.parse(req.files.publish.data.toString()).map(e=>{
				e.sendTime = Date.now();
				e.initials = e.firstname.substring(0,1)+e.lastname.substring(0,1);
				e.initials = e.initials.toUpperCase();
				e.id = uuid.v4();
				e.color = randomColor({
					luminosity: 'dark',
					format: 'hex'
				 });
				return e;
			})
			channel.assertQueue(queueName, {
				durable : false
			});
			channel.sendToQueue(queueName,Buffer.from(JSON.stringify(messagJson)));
			setTimeout(() => {
				channel.close();
				res.send({messsage : "Message send to Consumer"})
			}, 1000);
		})

	})
	}catch(err){
		console.log(err);
		res.status(400).send({message : "Error while sending the message"});
	}
	// res.send({ "message": "Message send to consumer" });
})

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/client/modules/views/index.html'));
});

module.exports = app;
