const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  locality: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: String,
  image: String,
  price: Number,
  sellingPrice: Number,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: {
    type: [orderItemSchema],
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  shippingAmount: {
    type: Number,
    required: true
  },

  subtotalAmount: {
    type: Number,
    required: true
  },

  address: {
    type: addressSchema,
    required: true
  },

  orderStatus: {
    type: String,
    enum: ["PLACED","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"],
    default: "PLACED"
  },

  paymentStatus: {
    type: String,
    enum: ["CREATED","PAID","FAILED","REFUNDED"],
    default: "CREATED"
  },

  razorpayOrderId: {
    type: String,
    required: true
  },

  razorpayPaymentId: {
    type: String,
    default: null
  },

  razorpaySignature: {
    type: String,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);