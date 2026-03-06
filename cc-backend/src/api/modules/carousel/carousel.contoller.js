
const Carousel = require("../carousel/carousel.model");
const { createImageLink } = require("../../utils/link-generator");
const slugify = require("slugify")
const container = require('@containers/awilix');
const storage = container.resolve('storage');

exports.getCarousel = async (req, res) => {
    try {
      let all = await Carousel.find({ isActive: true }).sort({ order: 1 }) 

      let slides = all.map((slide) => ({
        ...slide.toObject(),
        imageUrl: createImageLink(slide.imageUrl),
      }))

      return res.status(200).json({
        message: "Carousels Fetched",
        result: slides
      })

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getCarouselById = async (req, res) => {
    try {
      let { id } = req.params
      let result = await Carousel.findById(id)

      result.imageUrl = createImageLink(result.imageUrl)

      return res.status(200).json(result)

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.createCarousel = async (req, res) => {
  try {
    const { title } = req.body;
    const titleSlug = slugify(title, { lower: true });
    req.body.slug = titleSlug

    const result = await storage.uploadFile(req.file, {
        subdir: "carousels",
        filename: `${titleSlug}-${Date.now()}`,
        resize: { width: 1000 }
    });

    req.body.imageUrl = result.path

    const newCarousel = await Carousel.create(req.body)
    return res.status(201).json({
      message: "Carousel Added",
      result: newCarousel
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.updateCarousel = async (req, res) => {
  try {
      const cid = req.params.id
      const { title } = req.body;
      const carousel = await Carousel.findById(cid)
      if (!carousel) return res.status(404).json({ message: "Not found"})
      
      const titleSlug = slugify(title, { lower: true });
      req.body.slug = titleSlug

      if(req.file){
        await storage.deleteFile(carousel.imageUrl)
        const result = await storage.uploadFile(req.file, {
            subdir: "carousels",
            filename: `${titleSlug}-${Date.now()}`,
            resize: { width: 1000 }
        });
        req.body.imageUrl = result.path
      }
      
      
      const updated = await Carousel.findByIdAndUpdate(
        cid,
        req.body,
        { new: true }
      )
      
      return res.status(203).json({
        message: "Carousel Updated",
        result: updated
      })

  } catch (error) {
      console.log(error.message)
      return res.status(500).json({ message: "Internal Server Error" });
  }

}