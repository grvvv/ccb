let config = require('../../config/index.js')

const BASE_URL = config.domain

exports.createImageLink = (path) => {
    let link = BASE_URL + "/images/" + path 
    return link
}