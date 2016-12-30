// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var BeerSchema   = new mongoose.Schema({
  qrcode:  {
    type: String,
    unique: true,
    required: true
  },
  userId : String,
  state : {type: String, default: 'offline'},
});

// Export the Mongoose model
module.exports = mongoose.model('Device', BeerSchema);
