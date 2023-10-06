const express = require("express");
const isLogin = require("../../middlewares/isLogin");
const {
  fetchAllCategoriesCtrl,
  createCategoryCtrl,
  singleCategoryCtrl,
  deleteCategoryCtrl,
  updateCategoryCtrl,
} = require("../../controllers/categories/categoryController");

const categoryRouter = express.Router();

categoryRouter.post("/", isLogin, createCategoryCtrl);

categoryRouter.get("/", fetchAllCategoriesCtrl);

categoryRouter.get("/:id", singleCategoryCtrl );

categoryRouter.delete("/:id", isLogin, deleteCategoryCtrl);

categoryRouter.put("/:id", isLogin, updateCategoryCtrl );

module.exports = categoryRouter;
