const Cart = require("./cart.model");
const Product = require("../product/product.model");
const { createImageLink } = require("../../utils/link-generator");
const { getProductPrice, recalcCart } = require("../../utils/business-utils");
const cartService = require("./cart.service");

exports.addToCart = async (req, res) => {
    try {
        const cart = await cartService.addToCart(
            req.user.id,
            req.body.productId,
            req.body.quantity
        );

        return res.status(200).json({
            message: "Item added to cart",
            result: cart
        });

    } catch (err) {
        return res.status(400).json({
            message: err.message
        });
    }
};

exports.cartProducts = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user.id);

        if (!cart) {
            return res.status(200).json({
                result: {
                    items: [],
                    totalItems: 0,
                    subtotalAmount: 0,
                    shippingAmount: 0,
                    totalAmount: 0
                }
            });
        }

        const formattedItems = cart.items.map((item) => ({
            ...item.toObject(),
            image: createImageLink(item.image)
        }));

        return res.status(200).json({
            result: {
                ...cart.toObject(),
                items: formattedItems
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.updateCartItemQuantity = async (req, res) => {
    try {
        const cart = await cartService.updateCartItem(
            req.user.id,
            req.body.productId,
            req.body.quantity
        );

        return res.status(200).json({
            message: "Cart updated",
            result: cart
        });

    } catch (err) {
        return res.status(400).json({
            message: err.message
        });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const cart = await cartService.removeFromCart(
            req.user.id,
            req.params.productId
        );

        return res.status(200).json({
            message: "Item removed",
            result: cart
        });

    } catch (err) {
        return res.status(400).json({
            message: err.message
        });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const cart = await cartService.clearCart(req.user.id);

        return res.status(200).json({
            message: "Item removed",
            result: cart
        });

    } catch (err) {
        return res.status(400).json({
            message: err.message
        });
    }
}