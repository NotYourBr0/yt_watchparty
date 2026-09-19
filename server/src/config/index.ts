import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/new_yt',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
