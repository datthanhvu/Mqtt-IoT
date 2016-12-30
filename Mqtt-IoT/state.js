// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var stateSchema   = new mongoose.Schema({
  qrcode : {type : String, require : true },
  state : String,
  date: { type: Date, default: Date.now }
});

// Export the Mongoose model
module.exports = mongoose.model('state', stateSchema);