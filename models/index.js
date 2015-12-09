var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my-tv-db-p2');

module.exports.Character = require("./character.js")
module.exports.Show = require("./show.js")
module.exports.Actor = require("./actor.js")
