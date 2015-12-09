var mongoose = require('mongoose');
var CharacterSchema = require("./character.js").schema;

var ShowSchema = new mongoose.Schema({
  title: String,
  network: String,
  characters: [ CharacterSchema ]
});

var Show = mongoose.model('Show', ShowSchema);
module.exports = Show;
