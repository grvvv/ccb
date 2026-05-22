const Order = require("./order.model");
const Product = require("../product/product.model");

const getProductPrice = require("../../utils/get-product-price");
const calculateShipping = require("../../utils/calculate-shipping");

const razorpay = require("../../config/razorpay");

exports.createOrderUpdated = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, address } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }
        if (!address || !address.name || !address.phone || !address.street) {
            return res.status(400).json({
                message: "Invalid address",
            });
        }

        const productIds = items.map((item) => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
        });

        if (products.length !== items.length) {
            return res.status(400).json({
                message: "Some products not found",
            });
        }

        let subtotalAmount = 0;
        let totalWeight = 0;

        const orderItems = items.map((item) => {
            const product = products.find((p) => p._id.toString() === item.productId);

            if (!product) {
                throw new Error("Product not found");
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            const sellingPrice = getProductPrice(product, item.quantity);

            subtotalAmount += sellingPrice * item.quantity;

            totalWeight += product.weight * item.quantity;

            return {
                product: product._id,
                name: product.name,
                image: product.thumbnail,
                price: product.price,
                sellingPrice,
                quantity: item.quantity,
            };
        });

        const shippingAmount = calculateShipping(totalWeight);

        const totalAmount = subtotalAmount + shippingAmount;

        // Razorpay works in paise
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
            message: "Order created",
            result: {
                order,
                razorpayOrder,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message || "Failed to create order",
        });
    }
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { items, paymentMethod, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method required" });
    }

    if (!address || !address.name || !address.phone || !address.street) {
      return res.status(400).json({ message: "Invalid address" });
    }

    // Step 1: Fetch products from DB
    const productIds = items.map(item => item.productId);

    const products = await Product.find({
      _id: { $in: productIds }
    });

    if (products.length !== items.length) {
      return res.status(400).json({ message: "Some products not found" });
    }

    // Step 2: Build order items with snapshot
    let totalAmount = 0;

    const orderItems = items.map(item => {
      const product = products.find(p =>
        p._id.toString() === item.productId.toString()
      );

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const sellingPrice = product.sellingPrice || product.price;

      totalAmount += sellingPrice * item.quantity;

      return {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        sellingPrice,
        quantity: item.quantity
      };
    });

    // Step 3: Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      address
    });

    // Step 4: Reduce stock (basic version)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    return res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create order"
    });
  }
};