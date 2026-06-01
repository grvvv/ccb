const mongoose = require('mongoose')

const variantSchema = new mongoose.Schema({
    sku             : { type: String, required: true, trim: true, uppercase: true },
    attributes      : { type: Map, of: String, default: {} },
    stock           : { type: Number, required: true, min: 0, default: 0 },
    price           : { type: Number, min: 0  },
    sellingPrice    : { type: Number, min: 0  },
    weight          : { type: Number, min: 0 },
    dimensions      : {
        length  : { type: Number },
        width   : { type: Number },
        height  : { type: Number },
    },
}, { _id : true });

const productSchema = mongoose.Schema({
    name            : { type: String, required: true, trim: true },
    category        : { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Category" },
    thumbnail       : { type: String, required: true },
    productImages   : [{ type: String, required: true }],
    description     : { type: String },
    slug            : { type: String, required: true, lowercase: true, unique: true },
    stock           : { type: Number, required: true, min: 0, default: 0 },
    // --- Pricing ---
    price           : { type: Number, required: true, min: 0 },
    sellingPrice    : { type: Number, required : true, min: 0  },

    variantOptions: [{
        name: { type: String, required: true, lowercase: true, trim: true },
        values: [{ type: String, trim: true }],
    }],

    variants: { type: [variantSchema], default: [] },
    weight  : { type: Number, required: true },           // in grams

    dimensions: {
        length  : { type: Number, required: true },       // in cm
        width   : { type: Number, required: true },
        height  : { type: Number, required: true },
    },

    isCODAvailable : { type: Boolean, default: false },
    isActive : { type: Boolean, default: true },
}, { timestamps: true })

productSchema.index(
  { "variants.sku": 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Product", productSchema);