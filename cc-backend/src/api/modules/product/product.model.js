const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name : { type: String, required: true, trim: true },
    category : { type: String, required: true, ref: "Category" },
    thumbnail : { type: String, required: true },
    productImages : [{ type: String, required: true }],
    description : { type: String },
    price : { type: Number, required: true },
    slug: { type: String, required: true, lowercase: true },
    sellingPrice : { 
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return this.price >= value 
            }
        },
        message: "Selling price must be less than equal to MRP"
    },
    stock : { type: Number, required: true, default: 10 },
},{
    timestamps : true
})


module.exports = mongoose.model("Product", productSchema)
