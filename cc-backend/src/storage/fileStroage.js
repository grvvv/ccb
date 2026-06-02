const fs = require('fs')
const fsp = fs.promises;
const path = require('path');
const sharp = require('sharp');
const Storage = require('./storage');
const jwt = require('jsonwebtoken');
const config = require('../config');

class ImageStorage extends Storage {
  constructor() {
    super();
    this.storagePath = path.join(__dirname, '../../public/images');
  }

  async uploadFile(file, options = {}) {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new Error('Invalid file type. Only image uploads are allowed.');
    }

    const filename = options.filename
      ? `${options.filename}.webp`
      : `${Date.now()}.webp`;

    const relativePath = path.join(options.subdir || '', filename);
    const filePath = path.join(this.storagePath, relativePath);

    await fsp.mkdir(path.dirname(filePath), { recursive: true });

    await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);

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
