import express from 'express';
// controllers
import user from '../controllers/user.js';

import { decode } from '..//middlewares/jwt.js'
import upload from "../middlewares/upload.js";

const router = express.Router();

router
  .get('/',decode, user.onGetAllUsers)
  .post('/signUp', user.signUp)
  .post('/updatePhoto',decode, upload.single('file'), user.updatePhoto)
  .post('/updateProfile',decode, upload.array('files',5), user.updateProfile)
  .post('/sendGift',decode, user.sendGift)
  .post('/purchaseStar',decode, user.purchaseStar)
  .post('/convertGift',decode, user.convertGift)
  .post('/deletePhoto',decode, user.deletePhoto)
  .post('/login', user.login)
  .post('/googleSignIn', user.googleSignIn)
  .post('/', user.onCreateUser)
  .post('/searchUser', user.onSearchUsers)
  .get('/getUser',decode, user.onGetUser)
  .get('/getInteractions',decode, user.getInteractions)
  .get('/getGifts',decode, user.getGifts)
  .get('/:userId/addInteraction',decode, user.addInteraction)
  .get('/:userId/getUser', user.onGetUserById)
  .get('/:email/checkEmailExist', user.checkEmailExist)
  .delete('/:id', user.onDeleteUserById)

  
export default router;

