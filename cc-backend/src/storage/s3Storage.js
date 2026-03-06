const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const mime = require('mime-types');
const Storage = require('./storage');
const config = require('../config');

class S3Storage extends Storage {
  constructor() {
    super();

    this.bucket = config.storage.s3.bucket;
    this.basePath = 'images/'; // base folder inside bucket

    this.s3 = new S3Client({
      region: config.storage.s3.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  };

  async uploadFile(file, options = {}) {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new Error('Invalid file type. Only image uploads are allowed.');
    }

    const extension = mime.extension(file.mimetype) || 'png';
    const filename = `${options.filename}.${extension}` || `${Date.now()}.${extension}`;
    const key = `${options.subdir || ''}/${filename}`.replace(/\/+/g, '/');

    const uploadParams = {
      Bucket: this.bucket,
      Key: `images/${key}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    await this.s3.send(new PutObjectCommand(uploadParams));

    return {
      path: key,
      url: `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
  }

  async deleteFile(filePath) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: `${this.basePath}${filePath}`.replace(/\/+/g, '/')
    });

    return this.s3.send(command);
  }

  async getFileStream(filePath) {
    const key = `${this.basePath}${filePath}`.replace(/\/+/g, '/');
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    const response = await this.s3.send(command);
    return response.Body; // This is a readable stream
  }

  // Optional: Signed URL fetch method
  async getSignedUrl(filePath, expiresIn = 3600) {
    const key = `${this.basePath}${filePath}`.replace(/\/+/g, '/');
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }
}

module.exports = S3Storage;
