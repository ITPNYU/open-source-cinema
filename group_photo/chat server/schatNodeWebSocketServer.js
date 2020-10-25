//install node
//open a command line and run this "npm install websocket"
//then run this program in command line with  "node nameOfThisFile.js"

//More details about this program
//https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61

"use strict";
//from VSCODE AGAIN
// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

const fs = require('fs');
// websocket and http servers
var webSocketServer = require('websocket').server;
var https = require('https');

var positionOnCircle = 0;
var positionOnCircleV = 0;
const incrementH = 20;
const incrementV = 20;
//LOAD HISTORY FROM FILE
var history = { "all": {} };
var data = fs.readFileSync('./history.json'),
    history;
try {
    history = JSON.parse(data);
    console.log("READ IN HISTORY:");
    let biggestPositionOnCircle = 0;
    let biggestPositionOnCircleV = 0;
    let allHistory = history.all;
    for (var id in allHistory) {
        let thisHistory = allHistory[id];
        if (thisHistory.positionOnCircle > biggestPositionOnCircle) {
            biggestPositionOnCircle = thisHistory.positionOnCircle;
        }
        if (thisHistory.positionOnCircleV > biggestPositionOnCircleV) {
            biggestPositionOnCircleV = thisHistory.positionOnCircleV;
        }
    }
    positionOnCircle = biggestPositionOnCircle;
    positionOnCircleV = biggestPositionOnCircleV;

}
catch (err) {
    history = { "all": {} };
    console.log('There has been an error parsing your JSON.')
    console.log(err);
}

// list of currently connected clients (users)
var clients = [];

var dir = 1;

/**
 * HTTPS server
 */

var credentials = {
  key: fs.readFileSync('star_itp_io.key'),
  cert: fs.readFileSync('star_itp_io.pem')
};

var server = https.createServer(credentials, function(req, res) {
	// Nothing Here
});

server.listen(webSocketsServerPort, function () {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
// WebSocket server is tied to a HTTP server. WebSocket request is just
// an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
//var wsServer = new webSocketServer({ httpServer: server ,'grpc.max_send_message_length': 1024*1024*1024*100});
var wsServer = new webSocketServer({ httpServer: server });

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function (request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event

    var ID = false;
    console.log((new Date()) + ' Connection accepted.');

    //use the time as user name (hack) and send it back to them
    var ID = (new Date()).getTime();

    positionOnCircle += incrementH * dir;
    if (positionOnCircle >= 180 || positionOnCircle <= 0) {
        dir = -dir;
        positionOnCircleV += incrementV;
    }
    //positionOnCircle += 180 ;
    //if (clients.length % 2 == 0)  positionOnCircle += 180/clients.length 
    //let p =  positionOnCircle % 360
    let connectionJSON = {
        "connection": connection,
        "ID": ID,
        "positionOnCircle": positionOnCircle,
        "positionOnCircleV": positionOnCircleV,
        "origin": request.origin
    }
    clients[ID] = connectionJSON;

    let stringHistory = JSON.stringify(history.all);
    connection.send(JSON.stringify({ type: 'initial', contents: { "ID": ID, "positionOnCircle": positionOnCircle, "positionOnCircleV": positionOnCircleV, "history": stringHistory } }));

    // user sent some message
    connection.on('message', function (message) {
        //console.log(message);
        let thisJSON = JSON.parse(message.utf8Data);
        let type = thisJSON.type;

        if (type == "pic") {
            history.all[thisJSON.ID] = { "type": "history", "ID": thisJSON.ID, "positionOnCircle": thisJSON.positionOnCircle, "positionOnCircleV": thisJSON.positionOnCircleV };
            var json = JSON.stringify({ type: 'pic', contents: message });
            for (var id in clients) {
                clients[id].connection.send(json);
            }
        } else if (type == "text") {
            var json = JSON.stringify({ type: 'text', contents: message });
            if (thisJSON.text == "reset_history") {
                history = { "all": {} };
                console.log("reset", history);
            }
        } else if (type == "position") {
            if (history.all[thisJSON.ID]) { //only act on this if they sent a pic and it got inserted in history there
                history.all[thisJSON.ID] = { "type": "history", "ID": thisJSON.ID, "positionOnCircle": thisJSON.positionOnCircle, "positionOnCircleV": thisJSON.positionOnCircleV };

                var json = JSON.stringify({ type: 'position', contents: message });
                for (var id in clients) {
                    clients[id].connection.send(json);
                }
            }
        } else
            if (message.type === 'utf8') { // accept only text and sends it around
                console.log((new Date()) + ' Received Message from ' + ID + ': ' + message.utf8Data);
                if (message.utf8Data.text != "")
                    // broadcast message to all connected clients
                    var json = JSON.stringify({ type: 'message', contents: message });
                for (var id in clients) {
                    clients[id].connection.send(json);
                }
            }
    });


    // user disconnected
    connection.on('close', function (connection) {
        if (ID !== false) {
            console.log((new Date()) + " Peer " + connection.toLocaleString + " disconnected." + ID);
            // remove user from the list of connected clients
            delete clients[ID];
        }
        fs.writeFile('./history.json', JSON.stringify(history), function (err) {
            if (err) {
                console.log('There has been an error saving your configuration data.');
                console.log(err.message);
                return;
            }
            console.log('Configuration saved successfully.')
        });

    });

});

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

