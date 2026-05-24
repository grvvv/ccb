const Product = require("../product/product.model");
const Order = require("../orders/order.model");
const razorpay = require("../../../config/razorpay");
const { buildOrderFromCart } = require("./order.service");
const { createImageLink } = require("../../utils/link-generator");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address } = req.body;
    const { orderItems, subtotalAmount, shippingAmount, totalAmount } =
      await buildOrderFromCart({
        userId,
        items,
        address,
      });

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotalAmount,
      shippingAmount,
      totalAmount,
      address,
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
        message: "Order created successfully",
        order,
        razorpayOrder,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to create order",
    });
  }
};

exports.getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        filter.user = req.user.id;

        if (req.query.orderStatus) {
            filter.orderStatus = req.query.orderStatus;
        }

        const orders = await Order.find(filter)
            .populate("user", "name email")
            .populate("items.product", "name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        return res.json({
            message: "Orders Fetched",
            result: orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.user) {
            filter.user = req.query.user;
        }

        if (req.query.orderStatus) {
            filter.orderStatus = req.query.orderStatus;
        }

        const orders = await Order.find(filter)
            .populate("user", "name email")
            .populate("items.product", "name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        return res.json({
            message: "Orders Fetched",
            result: orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order)  return res.status(404).json({ message: "Order not found" });

    const formattedOrder = {
      ...order.toObject(),
      items: order.items.map((item) => ({
        ...item.toObject(),
        image: createImageLink(item.image)
      }))
    };

    return res.status(200).json({
      message: "Order fetched",
      result: formattedOrder
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate("user", "name email");

        if (!order) return res.status(404).json({ error: "Order Not Found" });

        const formattedOrder = {
            ...order.toObject(),
            items: order.items.map((item) => ({
                ...item.toObject(),
                image: createImageLink(item.image)
            }))
        };

        return res.json({
            message: "Order Updated",
            result: formattedOrder
        });

    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order Not Found" });

        order.orderStatus = orderStatus;
        await order.save();

        return res.json({
            message: "Order Status Updated",
            result: order
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order Not Found" });

        order.paymentStatus = paymentStatus;
        await order.save();
        return res.json({
            message: "Payment Status Updated",
            result: order
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ error: "Order Not Found" });

        return res.json({
            message: "Order Deleted"
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.cancelUnpaidOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "PAID") return res.status(400).json({ message: "Paid orders cannot be deleted" });

    await order.deleteOne();
    return res.status(201).json({ success: true });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
