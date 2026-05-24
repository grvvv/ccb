const express = require("express");
const router = express.Router();

const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelUnpaidOrder,
    deleteOrder,
    getMyOrders
} = require("./order.controller");

const { bsonChecker } = require("../../middlewares/policy.middleware");
const authorize = require('../../middlewares/role.middleware');
const { access } = require('../../middlewares/auth.middleware');

router.use(access)
router.get("/me", getMyOrders);
router.post("/add", createOrder);

// Create Order
router.get("/", authorize(['admin']), getAllOrders);
router.patch("/update/:id", authorize(['admin']), bsonChecker, updateOrder);
router.patch("/update-status/:id", authorize(['admin']), bsonChecker, updateOrderStatus);
router.patch("/update-payment/:id", authorize(['admin']), bsonChecker, updatePaymentStatus);
router.delete("/delete/:id", authorize(['admin']), bsonChecker, deleteOrder);
router.delete("/unpaid/:id", bsonChecker, cancelUnpaidOrder);


router.get("/:id", bsonChecker, getOrderById);

module.exports = router;
