const fs = require('fs')
const fsp = fs.promises;
const path = require('path');
const mime = require('mime-types'); // For mimetype to extension
const Storage = require('./storage');
const jwt = require('jsonwebtoken');
const config = require('../config');

const IP_ADDRESS = config.ip;
const PORT = config.port;

class ImageStorage extends Storage {
  constructor() {
    super();
    this.storagePath = path.join(__dirname, '../../public/images');
  }

  async uploadFile(file, options = {}) {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new Error('Invalid file type. Only image uploads are allowed.');
    }

    const extension = mime.extension(file.mimetype) || 'png';
    const filename = options.filename ? `${options.filename}.${extension}` : `${Date.now()}.${extension}`;

    const relativePath = path.join(options.subdir || '', filename);
    const filePath = path.join(this.storagePath, relativePath);

    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, file.buffer);

    return { 
      path: relativePath,
      fullPath: filePath,
    };
  }

  async deleteFile(filePath) {
    const fullPath = path.join(this.storagePath, filePath);
    return fsp.unlink(fullPath);
  }

  async getFileStream(filePath) {
    const fullPath = path.join(this.storagePath, filePath);
    return fs.createReadStream(fullPath);
  }
}

module.exports = ImageStorage;
