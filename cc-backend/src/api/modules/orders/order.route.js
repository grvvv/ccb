const express = require("express");
const router = express.Router();

const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder
} = require("./order.controller");

const { bsonChecker } = require("../../middlewares/policy.middleware");
const authorize = require('../../middlewares/role.middleware');
const { access } = require('../../middlewares/auth.middleware');

router.use(access)
router.get("/", getAllOrders);
router.get("/:id", bsonChecker, getOrderById);
router.post("/add", createOrder);

// Create Order
router.use(authorize(['admin']))
router.patch("/update/:id", bsonChecker, updateOrder);
router.patch("/update-status/:id", bsonChecker, updateOrderStatus);
router.patch("/update-payment/:id", bsonChecker, updatePaymentStatus);
router.delete("/delete/:id", bsonChecker, deleteOrder);

module.exports = router;
