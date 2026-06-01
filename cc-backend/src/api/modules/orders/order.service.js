const Product = require("../product/product.model");
const Cart = require("../cart/cart.model");
const { calculateShipping } = require("../../utils/business-utils");

exports.buildOrderFromCart = async ({ userId, address }) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

    if (!address?.name || !address?.phone || !address?.address || !address?.locality || !address?.pincode) {
        throw new Error("Invalid address");
    }

    const productIds = cart.items.map(i => i.product);

    const products = await Product.find({
        _id: { $in: productIds }
    });

    const productMap = new Map( 
        products.map((p) => [p._id.toString(), p])
    );

    for (const item of cart.items) {
        const product = productMap.get(item.product.toString());
        if (!product) throw new Error("Some products not found");
    }

    let subtotalAmount = 0;
    let totalWeight = 0;

    const orderItems = cart.items.map((item) => {
        const product = products.find(
            (p) => p._id.toString() === item.product.toString()
        );

        if (!product) throw new Error("Product missing in DB");

        if (item.variantId) {
            const variant = product.variants.id(item.variantId);
            if (!variant) throw new Error(`Variant not found for ${product.name}`);
            if (variant.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
        } else {
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
        }

        subtotalAmount += item.sellingPrice * item.quantity;
        totalWeight += item.weight * item.quantity;

        return {
            product: item.product,
            variantId: item.variantId,
            sku: item.sku,
            attributes: item.attributes,
            name: item.name,
            image: item.image,
            price: item.price,
            sellingPrice: item.sellingPrice,
            quantity: item.quantity,
            weight: item.weight,
        };
    });

    const shippingAmount = calculateShipping(totalWeight);
    const totalAmount = subtotalAmount + shippingAmount;

    return {
        orderItems,
        subtotalAmount,
        shippingAmount,
        totalWeight,
        totalAmount,
    };
};