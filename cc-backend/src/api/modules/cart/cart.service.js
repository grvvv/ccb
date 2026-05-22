const Cart = require("./cart.model");
const Product = require("../product/product.model");
const { getProductPrice, recalcCart } = require("../../utils/business-utils");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: []
    });
  }

  return cart;
}

async function addToCart(userId, productId, quantity) {
  quantity = Number(quantity);

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  if (quantity < 1) throw new Error("Invalid quantity");

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find(
    (i) => i.product.toString() === productId
  );

  const finalQty = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (product.stock < finalQty) {
    throw new Error("Insufficient stock");
  }

  const finalPrice = getProductPrice(product, finalQty);

  if (existingItem) {
    existingItem.quantity = finalQty;
    existingItem.sellingPrice = finalPrice;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.productImages?.[0] || "",
      price: product.price,
      sellingPrice: finalPrice,
      quantity,
      weight: product.weight
    });
  }

  recalcCart(cart);

  await cart.save();
  return cart;
}

async function updateCartItem(userId, productId, quantity) {
  quantity = Number(quantity);

  const cart = await getOrCreateCart(userId);

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (!item) throw new Error("Item not found in cart");

  if (quantity === 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );
  } else {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    item.quantity = quantity;
    item.sellingPrice = getProductPrice(product, quantity);
  }

  recalcCart(cart);

  await cart.save();
  return cart;
}

async function removeFromCart(userId, productId) {
  const cart = await getOrCreateCart(userId);

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== productId
  );

  recalcCart(cart);

  await cart.save();
  return cart;
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = []
  recalcCart(cart);

  await cart.save();
  return cart;
}

async function getCart(userId) {
  return await getOrCreateCart(userId);
}

module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  clearCart
};