require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.cloud' : '.env.local',
});
const os = require('os');

function getWirelessIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'Not found';
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  ip: getWirelessIPv4(),
  bcrypt: {
    saltRounds: 10
  },
  
  admin: {
    email: process.env.ADMIN_USER,
    password: process.env.ADMIN_PASSWORD,
    phone: process.env.ADMIN_PHONE
  },

  mongo: {
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB_NAME || 'crafty_cakes_db',
    options: {
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
    },
  },

//   redis: {
//     url: process.env.REDIS_HOST,
//     ttl: 86400, // 1 day in seconds
//   },

  jwt: {
    auth: {
      secret: process.env.AUTH_JWT_SECRET,
      expiry: '1h'
    },
    access: {
      secret: process.env.ACCESS_JWT_SECRET,
      expiry: '8d'
    },
    storage: {
      secret: process.env.STORAGE_JWT_SECRET,
      expiry: '5m'
    }
  },

  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
   
    s3: {
      bucket: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_REGION
    }
  },

  mailer: {
    email: process.env.MAILER_MAIL,
    password: process.env.MAILER_PASSWORD
  }

};

module.exports = config;