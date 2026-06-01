const SHIPPING_RATE_PER_KG = 80;

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
		subtotalAmount += item.sellingPrice * item.quantity;
		totalWeight += (item.weight || 0) * item.quantity;
	}

	const shippingAmount = exports.calculateShipping(totalWeight);

	cart.totalItems = totalItems;
	cart.weight = totalWeight;

	cart.subtotalAmount = subtotalAmount;
	cart.shippingAmount = shippingAmount;
	cart.totalAmount =
		subtotalAmount + shippingAmount;
};