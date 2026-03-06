const express = require('express');
const router = express.Router();
const { addToCart, cartProducts, removeFromCart, updateCartItemQuantity } = require("./cart.controller")
const { bsonChecker } = require('../../middlewares/policy.middleware');
const { access } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/storage.middleware');

router.use(access)
router.post("/add", addToCart)
router.get("/all", cartProducts)
router.put("/update", updateCartItemQuantity)
router.delete("/remove/:productId", bsonChecker, removeFromCart)
module.exports = router;
