const Order = require("./order.model");

const Product = require("../product/product.model");

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
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("items.product", "name price");

        if (!order) return res.status(404).json({ error: "Order Not Found" });

        return res.json({
            message: "Order Fetched",
            result: order
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!order) return res.status(404).json({ error: "Order Not Found" });

        return res.json({
            message: "Order Updated",
            result: order
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
