var mongoose = require('mongoose');

var ShowSchema = new mongoose.Schema({
  title: String,
  network: Number
});

var Show = mongoose.model('Show', ShowSchema);
module.exports = Show;
