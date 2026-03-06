const { createContainer, asClass, asValue } = require('awilix');
const config = require('../config');
// const S3Storage = require('../storage/s3Storage');
const ImageStorage = require('../storage/fileStroage');
const container = createContainer();

// Register dependencies
container.register({
  config: asValue(config),
  storage: asClass(ImageStorage)
});

module.exports = container;