require('module-alias/register')
const app = require('./app');
const connectDB = require('@db/mongo');
const config = require('@config');

const startServer = async () => {
  await connectDB();
  
  app.listen(config.port, () => {
    console.log('🚀 Server running in', config.env, 'mode');
    console.log('🔗 http://localhost:' + config.port);

    // For MongoDB - safely handles URI whether it contains @ or not
    const mongoDisplay = config.mongo.uri.includes('@') 
      ? config.mongo.uri.split('@')[1] 
      : config.mongo.uri;
    console.log('📦 MongoDB:', mongoDisplay);

});
};

startServer();