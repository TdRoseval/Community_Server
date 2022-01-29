const express = require("express");
const router = express.Router();
const CommentModel = require("../models/comments");
const ResCode = require("../utils/resultcode");
const { success, failure } = require("../utils/result");
const { checkLogin } = require("../middlewares/check");

// POST /comments 创建一条评论
router.post("/", checkLogin, function (req, res, next) {
  const author = req.user._id;
  const postId = req.fields.postId;
  const content = req.fields.content;

  // 校验参数
  try {
    if (!content.length) {
      throw new Error("请填写评论内容");
    }
  } catch (e) {
    const other = {
      info: e.message,
    };

    return failure(res, ResCode.PARAM_NOT_COMPLETE, undefined, other);
  }

  const comment = {
    author: author,
    postId: postId,
    content: content,
  };

  CommentModel.create(comment)
    .then(function () {
      success(res, ResCode.SUCCESS);
    })
    .catch(next);
});

// GET /comments/:commentId/remove 删除一条评论
router.get("/:commentId/remove", checkLogin, function (req, res, next) {
  const commentId = req.params.commentId;
  const author = req.user._id;

  CommentModel.getCommentById(commentId).then(function (comment) {
    if (!comment) {
      throw new Error("评论不存在");
    }
    if (comment.author.toString() !== author.toString()) {
      throw new Error("没有权限删除评论");
    }
    CommentModel.delCommentById(commentId)
      .then(function () {
        success(res, ResCode.SUCCESS);
      })
      .catch(next);
  });
});

module.exports = router;
