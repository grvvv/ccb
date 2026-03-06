let config = require('../../config/index.js')

const BASE_URL = `http://${config.ip}:${config.port}`

exports.createImageLink = (path) => {
    let link = BASE_URL + "/images/" + path 
    return link
}