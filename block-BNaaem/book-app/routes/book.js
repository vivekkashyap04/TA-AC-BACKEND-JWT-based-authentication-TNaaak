var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Book = require('../models/book');
const { deleteMany } = require('../models/user');
const { model } = require('mongoose');

router.post('/addbook', async (req, res, next) => {
  req.body.userId = req.user.id;
  req.body.tags = req.body.tags.trim().split(',');
  req.body.categories = req.body.categories.trim().split(',');
  try {
    var book = await Book.create(req.body);
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

//all-books
router.get('/allbook', async (req, res, next) => {
  try {
    var books = await Book.find({});
    res.status(200).json({ books });
  } catch (error) {
    return next(error);
  }
});

//only book of login user

router.get('/', async (req, res, next) => {
  try {
    var books = await Book.find({ userId: req.user.id });
    res.status(200).json({ books });
  } catch (error) {
    return next(error);
  }
});
//single book
router.get('/get-book/:id', async (req, res, next) => {
  var bookId = req.params.id;
  try {
    var book = await Version1Book.findById(bookId);
    res.status(200).json({ book });
  } catch (error) {
    return next(error);
  }
});

router.put('/edit-book/:id', async (req, res, next) => {
  var bookId = req.params.id;
  req.body.tags = req.body.tags.trim().split(',');
  req.body.categories = req.body.categories.trim().split(',');

  var book = await Book.findById(bookId);
  if (req.user.userId === book.userId) {
    try {
      var book = await Version1Book.findByIdAndUpdate(bookId, req.body, {
        new: true,
      });
      res.status(200).json({ book });
    } catch (error) {
      return next(error);
    }
  }
});

//Delete a book
router.delete('/delete-book/:id', async (req, res, next) => {
  var bookId = req.params.id;
  var book = await Book.findById(bookId);
  if (req.user.userId === book.userId) {
    try {
      var book1 = await Book.findByIdAndDelete(bookId);
      res.status(200).json({ book1 });
    } catch (error) {
      return next(error);
    }
  }
});

//list all category;

router.get('/categorylist', (req, res, next) => {
  Book.distinct('category', (err, list) => {
    if (err) return next(err);
    res.status(200).json({ categories });
  });
});

//list book by category
router.get('/listbookbycategory', (req, res, next) => {
  Book.aggregate([
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
  ]).exec(err, (data) => {
    if (err) return next(err);
    res.status(200).json({ data });
  });
});

// Count all Books by categories
router.get('/countbook', (req, res, next) => {
  Book.aggregate([
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]).exec(err, (data) => {
    if (err) return next(err);
    res.status(200).json({ data });
  });
});

//list book by author
router.get('/listbookbyauthor', (req, res, next) => {
  Book.aggregate([{ $sort: { author: 1 } }]).exec(err, (author) => {
    if (err) return next(err);
    res.status(200).json({ author });
  });
});

//list all category;

router.get('/taglist', (req, res, next) => {
  Book.distinct('category', (err, categories) => {
    if (err) return next(err);
    res.status(200).json({ categories });
  });
});

// list tags in ascending/descending order

router.get('/taglist/asec', (req, res, next) => {
  Book.distinct('category')
    .aggregate([{ $sort: { category: 1 } }])
    .exec(err, (categories) => {
      if (err) return next(err);
      res.status(200).json({ categories });
    });
});

router.get('/taglist/desc', (req, res, next) => {
  Book.distinct('category')
    .aggregate([{ $sort: { category: -1 } }])
    .exec(err, (categories) => {
      if (err) return next(err);
      res.status(200).json({ categories });
    });
});
//filter book by tags

router.get('/filter/:tag', (req, res, next) => {
  let tag = req.params.tag;
  Book.find({ tags: { $in: [tag] } }, (err, data) => {
    if (err) return next(err);
    res.status(200).json({ data });
  });
});

// Count all Books by categories
router.get('/countbookbytags', (req, res, next) => {
  Book.aggregate([
    { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]).exec(err, (data) => {
    if (err) return next(err);
    res.status(200).json({ data });
  });
});

module.exports = router;
