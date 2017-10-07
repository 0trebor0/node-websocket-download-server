process.title = "Download Server";
"use strict";
const fs = require('fs');
var websocket = require('ws');
var validUrl = require('valid-url');
const download = require('download');
var config = JSON.parse(JSON.stringify(require('./config.json')));
//
if(!fs.existsSync(config['serverConfig']['downloadFolder'])){
	fs.mkdirSync(config['serverConfig']['downloadFolder']);
	console.log("[Folder '"+config['serverConfig']['downloadFolder']+"' Created]");
}else{
	console.log("[Folder '"+config['serverConfig']['downloadFolder']+"' Already Exist]");
}
//
const wss = new websocket.Server({ port: config['serverConfig']['serverPort']});
console.log("Server Started on Port:"+config['serverConfig']['serverPort']);
//
wss.on('connection', function connection(ws){
	ws.on('message', function incoming(message){
		var receivedDecoded = new Buffer(message, 'base64').toString();
		console.log("#RECEIVED: "+message+" #DECODED: "+receivedDecoded+"");
		var jsonValue = JSON.parse(receivedDecoded);
		if(jsonValue['client']['status']=='hello'){
			var value = JSON.stringify({server:{status:'hey'}});
			var base64_encode = new Buffer(value).toString('base64');
			ws.send(base64_encode);
			console.log("#SENDING: "+base64_encode+" #DECODED: "+value);
		}else if(jsonValue['client'].hasOwnProperty('url')){
			if (validUrl.isUri(jsonValue['client']['url'])){
				//Url is Valid
				download(jsonValue['client']['url'], config['serverConfig']['downloadFolder']).then(() => {
					var value = JSON.stringify({server:{msg:'Download Done'}});
					var base64_encode = new Buffer(value).toString('base64');
					ws.send(base64_encode);
					console.log("#DOWNLOAD: "+jsonValue['client']['url']+" DONE");
				});
				var value = JSON.stringify({server:{msg:'DOWNLOADING'}});
				var base64_encode = new Buffer(value).toString('base64');
				ws.send(base64_encode);
				console.log("#DOWNLOADING: "+jsonValue['client']['url']);
			}else{
				//Url Not Valid
				var value = JSON.stringify({server:{msg:'Url Not Valid'}});
				var base64_encode = new Buffer(value).toString('base64');
				ws.send(base64_encode);
			}
		}
	});
});
