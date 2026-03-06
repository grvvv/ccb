const express = require('express');
const router = express.Router();
const { createCategory, getFeaturedCategories, updateCategory, toggleCategoryStatus } = require("./category.controller")
const { bsonChecker } = require('../../middlewares/policy.middleware');
const upload = require('../../middlewares/storage.middleware');
const authorize = require('../../middlewares/role.middleware');

const access = require("../../middlewares/auth.middleware.js");
// const role = require("../../middlewares/role.middleware.js");

// Public
router.get("/featured", getFeaturedCategories);

// Admin
router.use(access, authorize(['admin']))
router.post("/add", upload.single("image"), createCategory);
router.put("/:id", bsonChecker, updateCategory);
// router.patch("/:id/toggle", auth, role("admin"), toggleCategoryStatus);

module.exports = router;
