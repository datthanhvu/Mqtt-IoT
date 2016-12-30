/**
* <h1>API 1.0</h1>
*
*
* Studio : http://www.datthanhvu.com
* Company : http://www.datthanhvu.com
* <p>
* <b>Note:</b> If you want more information, always connect to dattv@hachi.com.vn or datvuthanh98@gmail.com
*
* @author  Datthanhvu
* @version 1.0
* @since   2016-18-12
*/
/********************************************************************************************************************************
 server API 1.0 use Nodejs
********************************************************************************************************************************/
var Status = require('./status');
var State = require('./state');
var Beer = require('./beer');
var User = require('./user');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var mqtt = require('mqtt');
ObjectId = require('mongodb').ObjectID;
var qrcode = [];
var email;
var state;
var qrcodecurrent;
/********************************************************************************************************************************
Connect to broker
********************************************************************************************************************************/
var client  = mqtt.connect('mqtt://localhost:1883');
/********************************************************************************************************************************
Connect to Mongodb
********************************************************************************************************************************/
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
// Connection URL
var url = 'mongodb://localhost:27017/server';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");
  findDocuments(db, function() {
         db.close();
       });
  findQrcode(db, function() {
              db.close();
            });
});
//============================================================================================
    //Find users
var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('users');
  // Find some documents
    collection.find({}).toArray(function(err, docs) {
    console.log("Found users");
    console.dir(docs[0].username);
    callback(docs);
  });
}
//============================================================================================
    //Find state of devices
var findState = function(db, callback) {
  // Get state data
  var collection = db.collection('states');
  for(i=0 ; i < qrcode.length ; i++) {
    // Find some documents
     var collection = db.collection('states');
     collection.find({"qrcode" : qrcode[i]}).toArray(function(err,states){
       console.log(states[states.length-1]);
     });

  }
}
//Notes !!!
//============================================================================================
    //Find qrcode users
var findQrcode = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('qrcodes');
  // Find some documents
    collection.find({}).toArray(function(err, docs) {
    console.log("QRcode hiện có : ");
    console.log(docs.length);
    for(i = 0 ; i < docs.length; i++) {
    /* Print All qrcode in collections */
    console.log(docs[i].qrcode);
    /* Subscribe all topics query name 'qrcode' */
    client.subscribe('ID/' + docs[i].qrcode + '/in');
    client.subscribe('ID/' + docs[i].qrcode + '/in/state');
    /* Append elememts 'qrcode' to Qrcode array */
    qrcode.push(docs[i].qrcode);
    console.log(qrcode);
    }
    callback(docs);
  });
}
//============================================================================================
    //Find users
var findUsers = function(qrcode2,db, callback) {
  // Get the documents collection
  var collection = db.collection('devices');
  console.log("Message qrcode : " + qrcode2);
  // Find some documents
    collection.find({"qrcode" : qrcode2}).toArray(function(err, docs) {
    console.log("Found qrcode of users : ");
    try {
      console.log(docs[0].userId);

  //============================================================================================
    //Find user when know userId
     var collection2 = db.collection('users');
     collection2.find({'_id' : ObjectId(docs[0].userId)}).toArray(function(err,docs) {
      try{
        console.log("Successfully ! Connect to email's users" + docs[0].username + qrcodecurrent)
      //  console.log(docs[0].username);
        email = docs[0].username;
        console.log(email);
      }
      catch(err) {
        console.log("Fail to load email");
      }
     });
    }
    catch(err){
    console.log("Loading qrcode of users failed.")
    }
    callback(docs);
  });

}
/********************************************************************************************************************************
Connect to database
********************************************************************************************************************************/
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/server');
/********************************************************************************************************************************
Connect mqtt broker
********************************************************************************************************************************/
client.on('connect', function () {
  console.log("Connect to MQTT Broker");
});
/********************************************************************************************************************************
Callback message from broker
********************************************************************************************************************************/
client.on('message', function (topic, message) {
  console.log(topic+'='+message);
  //============================================================================================
      // use for loop if n = -1 ==> topic not found in qrcode array
      // if n != -1 ==> topic
    for (i = 0 ; i < qrcode.length ; i++) {
      var n = topic.search(qrcode[i]);
      console.log(n);
      if ( n == -1 ) {
        console.log(qrcode[i] + " not found!!!");
      }
      else {
        /* OK ! */
        console.log("Sucess!!" + qrcode[i]);
  //============================================================================================
      // Check state of devices
      // if var state = -1 ==> topic callback not 'state'
        var state = topic.search("/state");
        if ( state == -1 ) {
          console.log("Not topic state : " + qrcode[i]);
          console.log("This is topic reveice data");
  //============================================================================================
      // Reponse from embedded system data
      // Save database
          var status = new Status();
          var message_obj = JSON.parse(message.toString());
          var data = message_obj.data;
          /* If message callback response return true or false */
          if ( data == null) {
            console.log("Callback");
            var status = message_obj.cmd.status;
            // Print success or false
            status.toString() == "1" ? console.log("Success") : console.log("Fail");
          }
          else {
          //============================================================================================
             //If message callback not return but message status of devices callback ==> Devices ONLINE

          var state = new State();
          state.qrcode = qrcode[i];
          console.log("state qrcode" + qrcode[i]);
          /* set qrcode current */
          qrcodecurrent = qrcode[i];
          console.log(qrcodecurrent);
          state.state = "online";
          state.save();
          MongoClient.connect(url, function(err, db) {
                console.log("Connected state again...");
                  findState(db, function() {
                        db.close();
                            });
              });
          //============================================================================================
              // Get username of devices
              // print qrcode current
              console.log("Qrcode current:" + qrcode[i]);
          MongoClient.connect(url, function(err, db) {
            console.log("Connected again...");
              findUsers(qrcodecurrent,db, function() {
                    db.close();
                        });
          });
          //============================================================================================
              // Save Database
              /* Get userId */
          var status_database = data.toString().split(",");
          status.userId = email;
          status.qrcode = qrcode[i];
          status.trangthai.temp = status_database[0];
          status.trangthai.humi = status_database[1];
          status.trangthai.lux = status_database[2];
          status.trangthai.port1 = status_database[3];
          status.trangthai.port2 = status_database[4];
          status.trangthai.port3 = status_database[5];
          status.trangthai.port4 = status_database[6];
          status.trangthai.port5 = status_database[7];
          status.save();
        }
        }
        else {
  //============================================================================================
       // Check state of devices
       // if var state = -1 ==> topic callback not 'state'
          console.log("OK,I'm fine . This is topic of state " + qrcode[i]);
          console.log(message.toString());
          var state = new State();
          state.qrcode = qrcode[i];
          state.state = message.toString();
          state.save();
          MongoClient.connect(url, function(err, db) {
                console.log("Connected state again...");
                  findState(qrcode[i],db, function() {
                        db.close();
                            });
              });
        }
      }
    }
});

/********************************************************************************************************************************
Configurate server on port 3000
********************************************************************************************************************************/
 server.listen(3000);
 console.log('Connect to port 3000');
 //
 
