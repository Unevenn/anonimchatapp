import mongoose from 'mongoose'
import {GridFsStorage} from 'multer-gridfs-storage'
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: "./config.env" });
const url = process.env.MONGODB_URI

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
      return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
              if (err) {
                  return reject(err);
              }
              const fileInfo = {
                  filename: file.originalname,
                  bucketName: 'uploads'
              };
              resolve(fileInfo);
              console.log(fileInfo)
          });
      });
  }
});

const upload = multer({ storage });

mongoose.connection.on('connected', () => {
  console.log('Mongo has connected succesfully')
})
mongoose.connection.on('reconnected', () => {
  console.log('Mongo has reconnected')
})
mongoose.connection.on('error', error => {
  console.log('Mongo connection has an error', error)
  mongoose.disconnect()
})
mongoose.connection.on('disconnected', () => {
  console.log('Mongo connection is disconnected')
})

export default upload;