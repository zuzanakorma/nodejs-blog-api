const express = require("express");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const {
  createPostCtrl,
  postDetailsCtrl,
  fetchPostsCtrl,
  deletePostCtrl,
  updatePostCtrl,
  toggleLikesPostCtrl,
  toggleDislikesPostCtrl,
} = require("../../controllers/posts/postController");
const isLogin = require("../../middlewares/isLogin");

const postRouter = express.Router();

// file upload middleware
const upload = multer({storage});

postRouter.post("/", isLogin, upload.single("image"), createPostCtrl);

postRouter.get("/:id", isLogin, postDetailsCtrl);

postRouter.get("/likes/:id", isLogin, toggleLikesPostCtrl);
postRouter.get("/dislikes/:id", isLogin, toggleDislikesPostCtrl);

postRouter.get("/", isLogin, fetchPostsCtrl);

postRouter.delete("/:id", isLogin, deletePostCtrl);

postRouter.put("/:id", isLogin, upload.single("image"), updatePostCtrl);

module.exports = postRouter;
