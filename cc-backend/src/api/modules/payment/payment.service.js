const crypto = require("crypto");
const config = require("@config");
const Order = require("../orders/order.model");
const Product = require("../product/product.model");
const Cart = require("../cart/cart.model");

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

    if (expectedSignature !== razorpay_signature) throw new Error("Invalid payment signature");

    const order = await Order.findById(appOrderId);

    if (!order) throw new Error("Order not found");
    if (order.paymentStatus === "PAID")  return { success: true };

    for (const item of order.items) {
        let result;

        if (item.variantId) {
            result = await Product.updateOne(
                {
                _id: item.product,
                variants: {
                        $elemMatch: {
                            _id: item.variantId,
                            stock: { $gte: item.quantity }
                        }
                    }
                },
                { $inc: { "variants.$.stock": -item.quantity } }
            );
        } else {
            result = await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity }},
                { $inc: { stock: -item.quantity } }
            );
        }

        if (result.modifiedCount === 0) throw new Error(`Insufficient stock for ${item.name}`);
    }

    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    await Cart.findOneAndUpdate(
        { user: order.user },
        {
            $set: {
                items: [],
                totalItems: 0,
                weight: 0,
                subtotalAmount: 0,
                shippingAmount: 0,
                totalAmount: 0
            }
        }
    );

    return { success: true };
};