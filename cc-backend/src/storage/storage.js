class Storage {
  async uploadFile(file, options) {
    throw new Error('Not implemented');
  }

  async deleteFile(filePath) {
    throw new Error('Not implemented');
  }

  async getFileStream(filePath) {
    throw new Error('Not implemented');
  }
}

module.exports = Storage;