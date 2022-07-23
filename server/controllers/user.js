// utils
import makeValidation from '@withvoid/make-validation';
// models
import UserModel, { USER_TYPES } from '../models/User.js';
// Bcrypt
import Bcrypt  from 'bcryptjs';
import jwt from 'jsonwebtoken';
const SECRET_KEY = 'some-secret-key';
export default {
  onGetAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getUsers();
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onGetUser: async (req, res) => {
    try {
      console.log(req.userId)
      const user = await UserModel.getUserById(req.userId);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onGetUserById: async (req, res) => {
    try {
      console.log(req.params.userId)
      const user = await UserModel.getUserById(req.params.userId);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  
  onCreateUser: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          firstName: { type: types.string },
          lastName: { type: types.string },
          type: { type: types.enum, options: { enum: USER_TYPES } },
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const { firstName, lastName, type } = req.body;
      const user = await UserModel.createUser(firstName, lastName, type);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  }, signUp: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          name: { type: types.string },
          email:{ type: types.string },
          pushToken:{ type: types.string },
          password: { type: types.string },
        }
      }));
      const { name, email, password,pushToken } = req.body;
      let bcryptedPassword = Bcrypt.hashSync(password,10);
      const user = await UserModel.createUser(name, email, bcryptedPassword,pushToken);
      const payload = {
        userId: user._id,
        password: bcryptedPassword,
      };   
      const authToken = jwt.sign(payload, SECRET_KEY);
      return res.status(200).json({ success: true,authToken,user});
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  login: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          email:{ type: types.string },
          pushToken:{ type: types.string },
          password: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json(validation);
  
      const { email, password,pushToken } = req.body;
      const user =   await UserModel.getUserByEmail(email)
      if(!Bcrypt.compareSync(password,user.password)){
        return res.status(200).json({ success: false,error:"Wrong Password"});
      }else{
        let bcryptedPassword = Bcrypt.hashSync(password,10);
        const payload = {
          userId: user._id,
          password: bcryptedPassword,
        };   
        await UserModel.updateUserPushToken(user._id,pushToken)
        const authToken = jwt.sign(payload, SECRET_KEY);
        return res.status(200).json({ success: true,authToken,user,});
      }
     
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onDeleteUserById: async (req, res) => {
    try {
      const user = await UserModel.deleteByUserById(req.params.id);
      return res.status(200).json({ 
        success: true, 
        message: `Deleted a count of ${user.deletedCount} user.` 
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  updatePhoto: async (req, res) => {
    try {
      if (req.file === undefined)
      {
        return res.status(200).json({
          error:"you must select a file."
        });
      }
      const image = `file/${req.file.originalname}`;
      const userId = req.userId;
      console.log(image);
      const user = await UserModel.updateUserPhoto( userId,image);
      return res.status(200).json({ 
        success: true, 
        image
      });
    } catch (error) {
      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).send({
          message: "Too many files to upload.",
        });
      }
      return res.status(500).send({
        error
      });
    }
  },
}