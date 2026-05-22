const SHIPPING_RATE_PER_KG = 80;

exports.getProductPrice = (product, quantity) => {
  let finalPrice = product.sellingPrice;

  if (
    !product.b2bPricingTiers ||
    product.b2bPricingTiers.length === 0
  ) {
    return finalPrice;
  }

  const tiers = [...product.b2bPricingTiers].sort(
    (a, b) => a.minQty - b.minQty
  );

  for (const tier of tiers) {
    const minMatched = quantity >= tier.minQty;
    const maxMatched =
      tier.maxQty === null || quantity <= tier.maxQty;

    if (minMatched && maxMatched) {
      finalPrice = tier.price;
    }
  }

  return finalPrice;
};

exports.calculateShipping = (totalWeight) => {
  const kg = totalWeight / 1000;
  const billableKg = Math.ceil(kg);
  return billableKg * SHIPPING_RATE_PER_KG;
};

exports.recalcCart = (cart) => {
  let totalItems = 0;
  let subtotalAmount = 0;
  let totalWeight = 0;

  for (const item of cart.items) {
    totalItems += item.quantity;

    subtotalAmount += (
      item.sellingPrice * item.quantity
    );

    totalWeight += (
      (item.weight || 0) * item.quantity
    );
  }

  const shippingAmount =
    exports.calculateShipping(totalWeight);

  cart.totalItems = totalItems;
  cart.totalWeight = totalWeight;
  cart.subtotalAmount = subtotalAmount;
  cart.shippingAmount = shippingAmount;
  cart.totalAmount =
    subtotalAmount + shippingAmount;
};