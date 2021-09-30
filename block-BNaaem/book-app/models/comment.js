let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let commentSchema = new Schema({
  title: String,
  likes: { type: String, default: 0 },
  bookId: { type: mongoose.Types.ObjectId, ref: 'Book' },
});

let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
