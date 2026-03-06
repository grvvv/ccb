const mongoose = require('mongoose')

const carouselSchema = new mongoose.Schema({
    imageUrl: { type: String , require: true },
    title: { type: String , require: true },
    description: { type: String },
    redirectUrl: { type: String , require: false },
    slug: { type: String, required: true, lowercase: true },
    order: { type: Number },
    isActive: { type: Boolean, require: true, default: true }
},{
    timestamps : true
})


module.exports =  mongoose.model("Carousel", carouselSchema)
