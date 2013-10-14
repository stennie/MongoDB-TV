var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var showSchema = new Schema({
    name: { type: String, required: true},
    episodes: [
        {
            number: Number,
            season: Number
        }
    ]
});

// showSchema.index({name : 1});
showSchema.statics.listNames = function(callback) {
    this.find({}, '_id name', callback);
};

var Show = mongoose.model('Show', showSchema, 'shows');
module.exports = Show;