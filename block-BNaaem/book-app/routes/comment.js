//creating new comment

router.post('/comment/new', (req, res, next) => {
  req.body.bookId = req.session.userId;
  Comment.create(req.body, (err, createdComment) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { comments: createdComment.id },
      },
      (err, updatedUser) => {
        res.json({ updatedUser });
      }
    );
  });
});

//edit a comment

router.get('/comment/edit/:id', (req, res, next) => {
  let id = req.params.id;

  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    res.json({ comment });
  });
});

router.put('/comment/:id/edit', (req, res, next) => {
  let id = req.params.id;

  Comment.findByIdAndUpdate(id, req.body, (err, updatedComment) => {
    if (err) return next(err);
    res.json({ updatedComment });
  });
});

//delete a comment
router.delete('/comment/:id/delete', async (req, res, next) => {
  let id = req.params.id;

  var comment = await Comment.findByIdAndDelete(id);
  try {
    let user = User.findByIdAndUpdate(data.bookId, {
      $pull: { comments: data.id },
    });
  } catch (error) {
    return error;
  }
});

module.exports = router;
