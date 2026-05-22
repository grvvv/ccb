const paymentService = require("./payment.service");

exports.verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appOrderId
    } = req.body;

    const result =
      await paymentService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        appOrderId
      });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      result
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Payment verification failed"
    });

  }
};