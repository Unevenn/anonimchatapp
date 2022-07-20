import express from 'express';
// controllers
import user from '../controllers/user.js';

import { decode } from '..//middlewares/jwt.js'

import upload from "../config/mongo.js";

const router = express.Router();

router
  .get('/', user.onGetAllUsers)
  .post('/signUp',user.signUp)
  .post('/updatePhoto',decode, upload.single('file'), user.updatePhoto)
  .post('/login', user.login)
  .post('/', user.onCreateUser)
  .get('/getUser',decode, user.onGetUser)
  .get('/:userId/getUser', user.onGetUserById)
  .delete('/:id', user.onDeleteUserById)

  
export default router;

