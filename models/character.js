var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CharacterSchema = new Schema({
  name: String,
  show: { type: Schema.Types.ObjectId, ref: 'Show' },
  actor: { type: Schema.Types.ObjectId, ref: 'Actor' }
});

var Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
