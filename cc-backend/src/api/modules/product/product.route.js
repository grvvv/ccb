const express = require('express');
const router = express.Router();
const { addProduct, deleteProduct, updateProduct, allProducts, productById } = require("./product.controller")
const { bsonChecker } = require('../../middlewares/policy.middleware');
const upload = require('../../middlewares/storage.middleware');
const authorize = require('../../middlewares/role.middleware');
const { access } = require('../../middlewares/auth.middleware');

router.get("/", allProducts)
router.get("/:id", bsonChecker, productById)

router.use(access, authorize(['admin']))
router.post("/add", upload.any(), addProduct)
router.patch("/update/:id", bsonChecker, upload.any(), updateProduct)
router.delete("/delete/:id", bsonChecker, deleteProduct)

module.exports = router;
