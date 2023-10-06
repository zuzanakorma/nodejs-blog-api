const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appError = require("../../utils/appError");


const createPostCtrl = async (req, res, next) => {
  const {title, description, category} = req.body;
  try {
    const author = await User.findById(req.userAuth);
    if (author.isBlocked) {
      return next(appError("Access denied, account blocked", 403));
    }
    const postCreated = await Post.create({
      title,
      description,
      user: author._id,
      category,
      photo: req?.file?.path,
    });
    author.posts.push(postCreated);
    await author.save();
    res.json({
      status: "success",
      data: postCreated,
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const fetchPostsCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find({})
        .populate("user")
        .populate("category", "title");

    const filteredPosts = posts.filter((post) => {
      const blockedUsers = post.user.blocked;
      const isBlocked = blockedUsers.includes(req.userAuth);
      return !isBlocked;
    });
    res.json({
      status: "success",
      count: posts.length,
      data: filteredPosts,
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const postDetailsCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const isViewed = post.numViews.includes(req.userAuth);
    if (isViewed) {
      return res.json({
        status: "success",
        data: post,
      });
    }
    post.numViews.push(req.userAuth);
    await post.save();
    res.json({
      status: "success",
      data: post,
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const deletePostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appError("You are not allowed to delete this post", 403));
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      data: "Post deleted",
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const updatePostCtrl = async (req, res, next) => {
  const {title, description, category} = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appError("You are not allowed to delete this post", 403));
    }
    await Post.findByIdAndUpdate(req.params.id, {
      title,
      description,
      category,
      photo: req?.file?.path,
    },
    {
      new: true,
    },
    );
    res.json({
      status: "success",
      data: "Post updated",
    });
  } catch (error) {
    next(appError(error.message));
  }
};


const toggleLikesPostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const isLiked = post.likes.includes(req.userAuth);

    if (isLiked) {
      post.likes = post.likes.filter(
          (like) => like.toString() !== req.userAuth.toString());
      await post.save();
    } else {
      post.likes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "success",
      data: "You have successfully liked the post",
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const toggleDislikesPostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const isUnliked = post.disLikes.includes(req.userAuth);

    if (isUnliked) {
      post.disLikes = post.disLikes.filter(
          (dislike) => dislike.toString() !== req.userAuth.toString());
      await post.save();
    } else {
      post.disLikes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "success",
      data: "You have successfully disliked the post",
    });
  } catch (error) {
    next(appError(error.message));
  }
};


module.exports = {
  createPostCtrl,
  postDetailsCtrl,
  fetchPostsCtrl,
  deletePostCtrl,
  updatePostCtrl,
  toggleLikesPostCtrl,
  toggleDislikesPostCtrl,
};
