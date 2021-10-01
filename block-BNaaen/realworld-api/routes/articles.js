var express = require('express');
const auth = require('../middlewares/auth');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const User = require('../models/User');
var router = express.Router();

router.post('/', auth.isLoggedIn, async function (req, res, next) {
  req.body.author = req.user;
  let article = await Article.create(req.body);

  let updatedUser = await User.findOneAndUpdate(
    {
      username: article.author.username,
    },
    { $push: { articles: createdArticle.id } }
  );

  res.json({ article: article });
});

router.get('/feed', auth.isLoggedIn, async (req, res, next) => {
  let limit = 20,
    skip = 0;
  if (req.query.limit) {
    limit = req.query.limit;
  }
  if (req.query.skip) {
    skip = req.query.skip;
  }
  try {
    let result = await User.findById(req.user.userId).distinct('followingList');
    console.log(result);
    let articles = await Article.find({ author: { $in: result } })
      .populate('author')
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });
    res.status(200).json({
      articles: articles.map((arr) => {
        return arr.displayArticle(req.user.userId);
      }),
      arcticlesCount: articles.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', auth.isLoggedIn, async function (req, res, next) {
  let slug = req.params.slug;

  let article = await Article.findOne({ slug });

  res.json({ article: article });
});

router.get('/', auth.authOptional, async (req, res, next) => {
  let id = req.user ? req.user.userId : false;
  var limit = 20,
    skip = 0;
  var tags = await Article.find({}).distinct('tagList');
  var authors = await User.find({}).distinct('_id');

  var tagList,
    author = null;
  if (req.query.tag) {
    tagList = req.query.tag;
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }
  if (req.query.skip) {
    skip = req.query.skip;
  }
  if (req.query.author) {
    var authorName = req.query.author;
    var user = await User.findOne({ username: authorName });
    if (!user) {
      return res
        .status(400)
        .json({ errors: { body: ['There is no results for this name'] } });
    }
    author = user.id;
  }

  try {
    if (req.query.favorited) {
      var favorited = req.query.favorited;
      var user = await User.findOne({ username: favorited });
      if (!user) {
        return res
          .status(400)
          .json({ errors: { body: ['There is no results for this name'] } });
      }
      var articles = await Article.find({
        tagList: !tagList ? { $in: tags } : tagList,
        favoriteList: user.id,
        author: !author ? { $in: authors } : author,
      })
        .populate('author')
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ createdAt: -1 });
      res.status(200).json({
        articles: articles.map((arr) => {
          return arr.displayArticle(id);
        }),
        arcticlesCount: articles.length,
      });
    } else if (!req.query.favorited) {
      console.log('yes');
      var articles = await Article.find({
        tagList: !tagList ? { $in: tags } : tagList,
        author: !author ? { $in: authors } : author,
      })
        .populate('author')
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ createdAt: -1 });
      res.status(200).json({
        articles: articles.map((arr) => {
          return arr.displayArticle(id);
        }),
        arcticlesCount: articles.length,
      });
    } else {
      return res
        .status(400)
        .json({ errors: { body: ['No results for the search'] } });
    }
  } catch (error) {
    next(error);
  }
});

router.put('/:slug', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;
  if (req.body.article.title) {
    req.body.article.slug =
      req.body.article.title
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
        .split(' ')
        .join('-')
        .toLowerCase() +
      '-' +
      random();
  }
  try {
    let article = await Article.findOne({ slug });
    if (!article) {
      return res.status(400).json({ errors: { body: ['No article found'] } });
    }
    if (req.user.userId == article.author) {
      article = await Article.findOneAndUpdate(
        { slug },
        req.body.article
      ).populate('author');
      return res
        .status(200)
        .json({ article: article.displayArticle(req.user.userId) });
    } else {
      return res
        .status(403)
        .json({ error: { body: ['Not allowed to perform this action'] } });
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:slug', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    if (!article) {
      return res
        .status(400)
        .json({ errors: { body: ['Theres is no article for this search'] } });
    }
    if (req.user.userId == article.author) {
      article = await Article.findOneAndDelete({ slug });
      let comments = await Comment.deleteMany({ articleId: article.id });
      return res.status(400).json({ msg: 'Article is successfully deleted' });
    } else {
      return res
        .status(403)
        .json({ error: { body: ['Not Authorized to perform this action'] } });
    }
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:slug/comments',
  auth.isLoggedIn,
  async function (req, res, next) {
    let slug = req.params.slug;
    let data = req.body;
    data.author = req.user;
    let article = await Article.findOne({ slug });

    data.article = article.id;

    let comment = await Comment.create(data);

    let loggedUser = await User.findOne({ username: req.user.username });

    let updatedUser = await User.findByIdAndUpdate(
      loggedUser.id,

      { $push: { comments: comment.id } }
    );

    let updatedArticle = await Article.findByIdAndUpdate(
      article.id,

      { $push: { comments: comment.id } }
    );

    res.json({ comment });
  }
);

router.get('/:slug/comments', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;

  let article = await Article.findOne({ slug }).populate('comments');

  res.json({ comments: article.comments });
});

router.delete(
  '/:slug/comments/:id',
  auth.isLoggedIn,
  async (req, res, next) => {
    let slug = req.params.slug;
    let commentId = req.params.id;

    let deletedComment = await Comment.findByIdAndDelete(commentId);

    let updatedUser = await User.findOneAndUpdate(
      { username: deletedComment.author.username },
      { $pull: { comments: deletedComment.id } }
    );

    let updatedArticle = await Article.findOneAndUpdate(
      { slug },
      { $pull: { comments: deletedComment.id } }
    );

    res.json({ user: updatedUser });
  }
);

router.post('/:slug/favorite', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    if (!article) {
      return res
        .status(400)
        .json({ errors: { body: ['Theres is no article for this search'] } });
    }
    let user = await User.findById(req.user.userId);
    if (!article.favoriteList.includes(user.id)) {
      article = await Article.findOneAndUpdate(
        { slug },
        { $inc: { favoritesCount: 1 }, $push: { favoriteList: user.id } }
      ).populate('author');
      return res.status(200).json({ article: article.displayArticle(user.id) });
    } else {
      return res.status(200).json({
        errors: { body: ['Article is already added in your favorite list'] },
      });
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:slug/favorite', auth.isLoggedIn, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    if (!article) {
      return res.status(400).json({ errors: { body: [' No article found'] } });
    }
    let user = await User.findById(req.user.userId);
    if (article.favoriteList.includes(user.id)) {
      article = await Article.findOneAndUpdate(
        { slug },
        { $inc: { favoritesCount: -1 }, $pull: { favoriteList: user.id } }
      ).populate('author');

      return res.status(200).json({ article: article.displayArticle(user.id) });
    } else {
      return res.status(200).json({
        errors: { body: ['Article is not added to the favorite list'] },
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
