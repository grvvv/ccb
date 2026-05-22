const crypto = require("crypto");
const config = require("@config");
const Order = require("../orders/order.model");
const Product = require("../product/product.model");

exports.verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    appOrderId
}) => {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", config.razorpay.keySecret)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid payment signature");
    }

    const order = await Order.findById(appOrderId);
    if (!order) throw new Error("Order not found");
    if (order.paymentStatus === "PAID") return { success: true }

    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity }}
        );
    }

    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    return { success: true };
};