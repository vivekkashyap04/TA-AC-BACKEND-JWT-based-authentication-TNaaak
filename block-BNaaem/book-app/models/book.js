let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let bookSchema = new Schema({
  title: String,
  author: String,
  description: String,
  price: { type: Number, default: 0 },
  categories: [String],
  tags: [String],
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

let Book = mongoose.model('Book', bookSchema);

module.exports = Book;
