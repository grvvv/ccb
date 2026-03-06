const mongoose = require('mongoose');
const config = require('../config');
const createUser = require('./defaultUser');
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo.uri + '/' + config.mongo.dbName, config.mongo.options);
    await createUser()
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;