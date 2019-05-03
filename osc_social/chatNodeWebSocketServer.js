//install node
//open a command line and run this "npm install websocket"
//then run this program in command line with  "node nameOfThisFile.js"

//More details about this program
//https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61

"use strict";

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;


// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
// latest 100 messages
var history = [];
// list of currently connected clients (users)
var clients = [];
var position = 0;

/**
 * HTTP server
 */
var server = http.createServer(function (request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
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
    var index = clients.push(connection) - 1;
    var ID = false;


    console.log((new Date()) + ' Connection accepted.');

    //use the time as user name (hack) and send it back to them
    var ID = (new Date()).getTime();

    //place them across from eachother somewhere on a circle
    position += 180;
    if (clients.length % 2 == 0) position += 180 / clients.length
    let p = position % 360

    //upon first connecting, assign them an ID and a place
    connection.send(JSON.stringify({ type: 'initial', contents: { "ID": ID, "position": p, "utf8Data": "{}" } }));



    // send back chat history
    // if (history.length > 0) {
    //     connection.send(JSON.stringify({ type: 'history', contents: history }));
    //  }

    // user sent some message
    connection.on('message', function (message) {

        let thisJSON = JSON.parse(message.utf8Data);
        let type = thisJSON.type;
        if (type == "pic") {
            var json = JSON.stringify({ type: 'pic', contents: message });
            for (var i = 0; i < clients.length; i++) {
                clients[i].send(json);
            }
        } else if (type == "text") {
            var json = JSON.stringify({ type: 'text', contents: message });
            for (var i = 0; i < clients.length; i++) {
                clients[i].send(json);
            }
            history.push(message);
            history = history.slice(-100);
        }
        // else if (type == "position") {
        //     var json = JSON.stringify({ type: 'position', contents: message });
        //     for (var i = 0; i < clients.length; i++) {
        //         clients[i].send(json);
        //     }
        // }
        // if (message.type === 'utf8') { // accept only text
        //console.log((new Date()) + ' Received Message from '+ ID + ': ' + message.utf8Data);
        // if (message.utf8Data.text != "")
        //  history.push(message);
        //  history = history.slice(-100);
        // broadcast message to all connected clients
        //  var json = JSON.stringify({ type: 'message', contents: message });
        // for (var i = 0; i < clients.length; i++) {
        //   clients[i].send(json);
        // }
        //}
    });


    // user disconnected
    connection.on('close', function (connection) {
        if (ID !== false) {
            console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected." + ID + " " + index);
            // remove user from the list of connected clients
            clients.splice(index, 1);
        }
    });

});

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

