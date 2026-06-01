const Cart = require("./cart.model");
const Product = require("../product/product.model");
const { recalcCart } = require("../../utils/business-utils");

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

async function addToCart(userId, productId, quantity, variantId = null) {
    quantity = Number(quantity);
    if (Number.isNaN(quantity) || quantity < 1) {
        throw new Error("Invalid quantity");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const hasVariants = product.variants?.length > 0;
    if (hasVariants && !variantId) throw new Error("Variant is required");
    if (!hasVariants && variantId) throw new Error("Product does not support variants");

    let variant = null;
    if (variantId) {
        variant = product.variants.id(variantId);
        if (!variant) throw new Error("Variant not found");
    }

    const cart = await getOrCreateCart(userId);
    const existingItem = cart.items.find((i) =>
        isSameCartItem(i, productId, variantId)
    );

    const finalQty = existingItem
        ? existingItem.quantity + quantity
        : quantity;

    if (variant) {
        if (variant.stock < finalQty) {
            throw new Error("Insufficient stock");
        }
    } else {
        if (product.stock < finalQty) {
            throw new Error("Insufficient stock");
        }
    }

    const finalPrice = variant?.price ?? product.price;
    const finalSellingPrice = variant?.sellingPrice ?? product.sellingPrice;
    const finalWeight = variant?.weight ?? product.weight;

    if (existingItem) {
        existingItem.quantity = finalQty;
    } else {
        cart.items.push({
            product: product._id,
            variantId: variant?._id ?? null,
            sku: variant?.sku ?? null,
            attributes: variant?.attributes
                ? Object.fromEntries(variant.attributes)
                : {},
            name: product.name,
            image: product.productImages?.[0] || "",
            price: finalPrice,
            sellingPrice: finalSellingPrice,
            quantity,
            weight: finalWeight,
        });
    }

    recalcCart(cart);

    await cart.save();
    return cart;
}

async function updateCartItem(userId, productId, quantity, variantId = null) {
    quantity = Number(quantity);
    if (Number.isNaN(quantity) || quantity < 0) {
        throw new Error("Invalid quantity");
    }

    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((i) => isSameCartItem(i, productId, variantId));
    if (!item) throw new Error("Item not found in cart");

    if (quantity === 0) {
        cart.items = cart.items.filter(
            (i) => !isSameCartItem(i, productId, variantId)
        );
    } else {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        let variant = null;
        if (variantId) {
            variant = product.variants.id(variantId);
            if (!variant) throw new Error("Variant not found");
            if (variant.stock < quantity) throw new Error("Insufficient stock");
        } else {
            if (product.stock < quantity) throw new Error("Insufficient stock");
        }

        item.quantity = quantity;
        item.price = variant?.price ?? product.price;
        item.sellingPrice = variant?.sellingPrice ?? product.sellingPrice;
        item.weight = variant?.weight ?? product.weight;
        item.attributes = variant?.attributes
            ? Object.fromEntries(variant.attributes)
            : {};
    }

    recalcCart(cart);
    await cart.save();

    return cart;
}

async function removeFromCart(userId, productId, variantId = null) {
    const cart = await getOrCreateCart(userId);

    cart.items = cart.items.filter(
        (i) => !isSameCartItem(i, productId, variantId)
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

function normalizeId(value) {
    return (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "null"
    )
        ? null
        : String(value);
}

// add helper
function isSameCartItem(item, productId, variantId) {
    return (
        item.product.toString() === productId &&
        normalizeId(item.variantId) === normalizeId(variantId)
    );
}

module.exports = {
    addToCart,
    updateCartItem,
    removeFromCart,
    getCart,
    clearCart
};