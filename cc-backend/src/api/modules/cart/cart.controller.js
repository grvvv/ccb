const Cart = require("./cart.model")
const Product = require("../product/product.model")

const recalcCart = (cart) => {
  let totalItems = 0;
  let totalAmount = 0;

  cart.items.forEach(item => {
    totalItems += item.quantity;
    totalAmount += item.quantity * item.sellingPrice;
  });

  cart.totalItems = totalItems;
  cart.totalAmount = totalAmount;
};


exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: product._id,
                name: product.name,
                image: product.productImages[0],
                price: product.price,
                sellingPrice: product.sellingPrice,
                quantity
            });
        }

        cart.totalItems = cart.items.reduce((a, b) => a + b.quantity, 0);
        cart.totalAmount = cart.items.reduce(
            (a, b) => a + b.sellingPrice * b.quantity,
            0
        );

        await cart.save();
        return res.status(201).json(cart);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: "Internal Server Error"})
    }
};

exports.cartProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ "user": userId })

        return res.status(201).json({ "result": cart });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: "Internal Server Error"})
    }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { productId, quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) return res.status(404).json({ message: "Product Not Found" });

    // Remove item if quantity is 0
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    recalcCart(cart);
    await cart.save();

    res.status(200).json({
      message: "Cart Updated",
      cart
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart Not Found" });
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        recalcCart(cart);
        await cart.save();

        res.status(200).json({
            result: cart
        });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};