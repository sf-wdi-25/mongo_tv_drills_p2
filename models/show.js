var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ShowSchema = new Schema({
  title: String,
  network: String,
  characters: [{ type: Schema.Types.ObjectId, ref: 'Character' }]
});

var Show = mongoose.model('Show', ShowSchema);
module.exports = Show;
