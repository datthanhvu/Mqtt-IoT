// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var statusSchema   = new mongoose.Schema({
  userId : String,
  automationmode : {type: String, default: '0'},
  qrcode : {type : String, require : true },
  trangthai : { 
  temp : {type: String, default: '0'},
  humi : {type: String, default: '0'},
  lux :  {type: String, default: '0'},
  port1 : {type: String, default: '0'},
  port2 : {type: String, default: '0'},
  port3 : {type: String, default: '0'},
  port4 : {type: String, default: '0'},
  port5 : {type: String, default: '0'}
},
  status : String,
  date: { type: Date, default: Date.now }
});

// Export the Mongoose model
module.exports = mongoose.model('status', statusSchema);