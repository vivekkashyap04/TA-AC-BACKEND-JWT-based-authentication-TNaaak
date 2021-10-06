let mongoose = require('mongoose');
let slugger = require('slugger');

let Schema = mongoose.Schema;

let articleSchema = new Schema(
  {
    slug: { type: String, require: true, unique: true },
    title: { type: String, require: true },
    description: { type: String },
    body: { type: String },
    tagList: [{ type: String }],
    favorited: [{ type: Schema.Types.ObjectId }],
    favoritesCount: { type: Number, default: 0 },
    author: { type: Object },
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

articleSchema.pre('save', async function (next) {
  this.slug = slugger(this.title);
  next();
});

mongoose.model('Article', articleSchema);

module.exports = mongoose.model('Article', articleSchema);
