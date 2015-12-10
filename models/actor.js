var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActorSchema = new Schema({
  name: String,
  year_of_birth: Number,
  hometown: String,
  roles: [{ type: Schema.Types.ObjectId, ref: 'Character' }]
});

var Actor = mongoose.model('Actor', ActorSchema);
module.exports = Actor;
