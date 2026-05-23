const mongoose = require('mongoose')

const b2bPricingTierSchema = new mongoose.Schema({
    minQty  : { type: Number, required: true },   // e.g. 10
    maxQty  : { type: Number, default: null },     // null = unlimited
    price   : { type: Number, required: true },    // b2b selling price at this tier
}, { _id: false })

const productSchema = mongoose.Schema({
    name            : { type: String, required: true, trim: true },
    category        : { type: String, required: true, ref: "Category" },
    thumbnail       : { type: String, required: true },
    productImages   : [{ type: String, required: true }],
    description     : { type: String },
    slug            : { type: String, required: true, lowercase: true },

    // --- Pricing ---
    price           : { type: Number, required: true },   // MRP
    sellingPrice    : {                                    // B2C selling price
        type     : Number,
        required : true,
    },
    b2bPricingTiers : {                                   // sorted by minQty asc
        type    : [b2bPricingTierSchema],
        default : []
    },

    sku     : { type: String, required: true, unique: true, trim: true },
    stock   : { type: Number, required: true, default: 10 },

    weight  : { type: Number, required: true },           // in grams
    dimensions: {
        length  : { type: Number, required: true },       // in cm
        width   : { type: Number, required: true },
        height  : { type: Number, required: true },
    },

    isCODAvailable : { type: Boolean, default: false },

}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema);