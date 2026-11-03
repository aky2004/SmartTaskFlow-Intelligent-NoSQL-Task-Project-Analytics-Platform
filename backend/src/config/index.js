const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5050,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-taskflow',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
