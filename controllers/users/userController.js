const bcrypt = require("bcryptjs");
const User = require("../../model/User/User");
const {appError, AppError} = require("../../utils/appError");
const generateToken = require("../../utils/generateToken");
const Post = require("../../model/Post/Post");
const Category = require("../../model/Category/Category");


const userRegisterCtrl = async (req, res, next) => {
  const {firstname, lastname, email, password} = req.body;
  try {
    const userFound = await User.findOne({email});
    if (userFound) {
      return next(new AppError("User Already Exist", 500));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const userLoginCtrl = async (req, res, next) => {
  const {email, password} = req.body;
  try {
    const userFound = await User.findOne({email});
    if (!userFound) {
      return next(appError("Invalid login credentials"));
    }
    const isPasswordMatched = await bcrypt.compare(
        password,
        userFound.password,
    );

    if (!isPasswordMatched) {
      if (!userFound) {
        return next(appError("Invalid login credentials"));
      }
    }
    res.json({
      status: "success",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    next(appError(error.message));
  }
};


const whoViewedMyProfileCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const userWhoViewed = await User.findById(req.userAuth);
    if (user && userWhoViewed) {
      const isUserAlreadyViewed = user.viewers.find(
          (viewer) => viewer.toString() === userWhoViewed._id.toJSON(),
      );
      if (isUserAlreadyViewed) {
        return next(appError("You already viewed this profile"));
      } else {
        user.viewers.push(userWhoViewed._id);
        await user.save();
        res.json({
          status: "success",
          data: "You have successfully viewed this profile",
        });
      }
    }
  } catch (error) {
    next(appError(error.message));
  }
};


const followingCtrl = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const userWhoFollowed = await User.findById(req.userAuth);

    if (userToFollow && userWhoFollowed) {
      const isUserAlreadyFollowed = userToFollow.following.find(
          (follower) => follower.toString() === userWhoFollowed._id.toString(),
      );
      if (isUserAlreadyFollowed) {
        return next(appError("You already followed this user"));
      } else {
        userToFollow.followers.push(userWhoFollowed._id);
        userWhoFollowed.following.push(userToFollow._id);
        await userWhoFollowed.save();
        await userToFollow.save();
        res.json({
          status: "success",
          data: "You have successfully this user",
        });
      }
    }
  } catch (error) {
    next(appError(error.message));
  }
};

const usersCtrl = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      count: users.length,
      status: "success",
      data: users,
    });
  } catch (error) {
    next(appError(error.message));
  }
};


const unFollowCtrl = async (req, res, next) => {
  try {
    const userToBeUnfollowed = await User.findById(req.params.id);
    const userWhoUnFollowed = await User.findById(req.userAuth);
    if (userToBeUnfollowed && userWhoUnFollowed) {
      const isUserAlreadyFollowed = userToBeUnfollowed.followers.find(
          // eslint-disable-next-line max-len
          (follower) => follower.toString() === userWhoUnFollowed._id.toString(),
      );
      if (!isUserAlreadyFollowed) {
        return next(appError("You have not followed this user"));
      } else {
        userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter(
            // eslint-disable-next-line max-len
            (follower) => follower.toString() !== userWhoUnFollowed._id.toString(),
        );
        await userToBeUnfollowed.save();
        userWhoUnFollowed.following = userWhoUnFollowed.following.filter(
            (following) =>
              following.toString() !== userToBeUnfollowed._id.toString(),
        );

        await userWhoUnFollowed.save();
        res.json({
          status: "success",
          data: "You have successfully unfollowed this user",
        });
      }
    }
  } catch (error) {
    next(appError(error.message));
  }
};

const blockUsersCtrl = async (req, res, next) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    const userWhoBlocked = await User.findById(req.userAuth);
    if (userWhoBlocked && userToBeBlocked) {
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
          (blocked) => blocked.toString() === userToBeBlocked._id.toString(),
      );
      if (isUserAlreadyBlocked) {
        return next(appError("You already blocked this user"));
      }
      userWhoBlocked.blocked.push(userToBeBlocked._id);
      await userWhoBlocked.save();
      res.json({
        status: "success",
        data: "You have successfully blocked this user",
      });
    }
  } catch (error) {
    next(appError(error.message));
  }
};


const unblockUserCtrl = async (req, res, next) => {
  try {
    const userToBeUnBlocked = await User.findById(req.params.id);
    const userWhoUnBlocked = await User.findById(req.userAuth);
    if (userToBeUnBlocked && userWhoUnBlocked) {
      const isUserAlreadyBlocked = userWhoUnBlocked.blocked.find(
          (blocked) => blocked.toString() === userToBeUnBlocked._id.toString(),
      );
      if (!isUserAlreadyBlocked) {
        return next(appError("You have not blocked this user"));
      }
      userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
          (blocked) => blocked.toString() !== userToBeUnBlocked._id.toString(),
      );
      await userWhoUnBlocked.save();
      res.json({
        status: "success",
        data: "You have successfully unblocked this user",
      });
    }
  } catch (error) {
    next(appError(error.message));
  }
};


const adminBlockUserCtrl = async (req, res, next) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    if (!userToBeBlocked) {
      return next(appError("User not Found"));
    }
    userToBeBlocked.isBlocked = true;
    await userToBeBlocked.save();
    res.json({
      status: "success",
      data: "You have successfully blocked this user",
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const adminUnblockUserCtrl = async (req, res, next) => {
  try {
    const userToBeunblocked = await User.findById(req.params.id);
    if (!userToBeunblocked) {
      return next(appError("User not Found"));
    }
    userToBeunblocked.isBlocked = false;
    await userToBeunblocked.save();
    res.json({
      status: "success",
      data: "You have successfully unblocked this user",
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const userProfileCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.userAuth);
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error.message);
  }
};


const updateUserCtrl = async (req, res, next) => {
  const {email, lastname, firstname} = req.body;
  try {
    if (email) {
      const emailTaken = await User.findOne({email});
      if (emailTaken) {
        return next(appError("Email is taken", 400));
      }
    }

    const user = await User.findByIdAndUpdate(
        req.userAuth,
        {
          lastname,
          firstname,
          email,
        },
        {
          new: true,
          runValidators: true,
        },
    );
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appError(error.message));
  }
};


const updatePasswordCtrl = async (req, res, next) => {
  const {password} = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(
          req.userAuth,
          {password: hashedPassword},
          {new: true, runValidators: true},
      );
      res.json({
        status: "success",
        data: "Password has been changed successfully",
      });
    } else {
      return next(appError("Please provide password field"));
    }
  } catch (error) {
    next(appError(error.message));
  }
};


const deleteUserAccountCtrl = async (req, res, next) => {
  try {
    const userTodelete = await User.findById(req.userAuth);
    await Post.deleteMany({user: req.userAuth});
    await Category.deleteMany({user: req.userAuth});
    await userTodelete.deleteOne();
    return res.json({
      status: "success",
      data: "Your account has been deleted successfully",
    });
  } catch (error) {
    next(appError(error.message));
  }
};

const profilePhotoUploadCtrl = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.userAuth);

    if (!userToUpdate) {
      return next(appError("User not found", 403));
    }
    if (userToUpdate.isBlocked) {
      return next(appError("Action not allowed, your account is blocked", 403));
    }
    if (req.file) {
      await User.findByIdAndUpdate(
          req.userAuth,
          {
            $set: {
              profilePhoto: req.file.path,
            },
          },
          {
            new: true,
          },
      );
      res.json({
        status: "success",
        data: "You have successfully updated your profile photo",
      });
    }
  } catch (error) {
    next(appError(error.message, 500));
  }
};

module.exports = {
  userRegisterCtrl,
  userLoginCtrl,

  usersCtrl,
  userProfileCtrl,
  updateUserCtrl,
  profilePhotoUploadCtrl,
  whoViewedMyProfileCtrl,
  followingCtrl,
  unFollowCtrl,
  blockUsersCtrl,
  unblockUserCtrl,
  adminBlockUserCtrl,
  adminUnblockUserCtrl,
  updatePasswordCtrl,
  deleteUserAccountCtrl,
};
