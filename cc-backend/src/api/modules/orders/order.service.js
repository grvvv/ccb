const Product = require("../product/product.model");
const Order = require("../orders/order.model");

const { getProductPrice, recalcCart, calculateShipping } = require("../../utils/business-utils");

exports.buildOrderFromCart = async ({ userId, items, address }) => {
  if (!items?.length) {
    throw new Error("Cart is empty");
  }

  if (!address?.name || !address?.phone || !address?.address || !address?.locality || !address?.pincode) {
    throw new Error("Invalid address");
  }

  const productIds = items.map(i => i.productId);

  const products = await Product.find({
    _id: { $in: productIds }
  });

  if (products.length !== items.length) {
    throw new Error("Some products not found");
  }

  let subtotalAmount = 0;
  let totalWeight = 0;

  const orderItems = items.map(item => {
    const product = products.find(
      p => p._id.toString() === item.productId
    );

    if (!product) {
      throw new Error("Product missing in DB");
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const sellingPrice = getProductPrice(product, item.quantity);

    subtotalAmount += sellingPrice * item.quantity;
    totalWeight += (product.weight || 0) * item.quantity;

    return {
      product: product._id,
      name: product.name,
      image: product.thumbnail,
      price: product.price,
      sellingPrice,
      quantity: item.quantity
    };
  });

  const shippingAmount = calculateShipping(totalWeight);
  const totalAmount = subtotalAmount + shippingAmount;

  return {
    orderItems,
    subtotalAmount,
    shippingAmount,
    totalAmount
  };
};