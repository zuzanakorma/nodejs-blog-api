const express = require("express");
const {
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
} = require("../../controllers/users/userController");

const isLogin = require("../../middlewares/isLogin");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const isAdmin = require("../../middlewares/isAdmin");


const userRouter = express.Router();
const upload = multer({storage});

// userRouter.get("/", usersCtrl);

userRouter.post("/register", userRegisterCtrl);
userRouter.post("/login", userLoginCtrl);


userRouter.get("/", usersCtrl);
userRouter.get("/profile", isLogin, userProfileCtrl);

userRouter.put("/", isLogin, updateUserCtrl);

userRouter.post("/profile-photo-upload",
    isLogin,
    upload.single("profile"),
    profilePhotoUploadCtrl);

userRouter.get("/profile-viewers/:id", isLogin, whoViewedMyProfileCtrl );
userRouter.get("/following/:id", isLogin, followingCtrl );
userRouter.get("/unfollowing/:id", isLogin, unFollowCtrl );
userRouter.get("/block/:id", isLogin, blockUsersCtrl );
userRouter.get("/unblock/:id", isLogin, unblockUserCtrl );

userRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockUserCtrl );
userRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnblockUserCtrl );

userRouter.put("/update-password", isLogin, updatePasswordCtrl );
userRouter.delete("/delete-account", isLogin, deleteUserAccountCtrl);


module.exports = userRouter;
