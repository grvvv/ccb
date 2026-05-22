const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },

  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  weight: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true
    },

    items: [cartItemSchema],
    totalItems: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    subtotalAmount: {type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
