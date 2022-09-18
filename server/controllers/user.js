// utils
import makeValidation from '@withvoid/make-validation';
// models
import UserModel from '../models/User.js';
// Bcrypt
import GiftModel from '../models/Gift.js';
import Bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import schedule from 'node-schedule';
import ChatMessageModel from "../models/ChatMessage.js"
import notification from "../middlewares/send_notification.js";
import path from 'path';
import multer from 'multer';
const upload = multer().single('file');

const SECRET_KEY = 'some-secret-key';
export default {
  onGetAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getUsers();
      const currentLoggedUserID = req.userId;
      var filteredUsers = users.filter(function (item) {
        return item._id != currentLoggedUserID;
      });
      return res.status(200).json({ success: true, "users": filteredUsers });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onSearchUsers: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          searchText: { type: types.string },
        }
      }));
      var users = await UserModel.searchUsers(req.body.searchText);
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onGetUser: async (req, res) => {
    try {
      var user = await UserModel.getUserById(req.userId);
      console.log(user)
      if (user && user.length != 0) {
        return res.status(200).json({ success: true, "user": user[0] });
      } else {
        return res.status(200).json({ success: false, "error": 'No user found' });
      }

    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onGetUserById: async (req, res) => {
    try {
      console.log(req.params.userId)
      var user = await UserModel.getUserById(req.params.userId);
      if (user && user.length != 0) {
        return res.status(200).json({ success: true, "user": user[0] });
      } else {
        return res.status(200).json({ success: false, "error": 'No user found' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  checkEmailExist: async (req, res) => {
    try {
      var email = req.params.email
      var user = await UserModel.getUserByEmail(email);
      console.log(user.length)
      if (!user || user.length == 0) {
        return res.status(200).json({ success: true, "user": false });
      } else {
        return res.status(200).json({ success: true, "user": true });
      }


    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getInteractions: async (req, res) => {
    try {
      var userId = req.userId;
      const interactions = await UserModel.getInteractions(userId);



      return res.status(200).json({ success: true, interactions });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getGifts: async (req, res) => {
    try {
      var userId = req.userId;
      console.log(userId)
      var gifts = await GiftModel.getGifts(userId);
      console.log(gifts)

      return res.status(200).json({ success: true, gifts });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  addInteraction: async (req, res) => {
    try {
      var userId = req.params.userId;
      var currentLoggedUserID = req.userId;
      const update = await UserModel.checkInteraction(currentLoggedUserID, userId);
      if (update.n == 0) {
        if (userId !== currentLoggedUserID) {
          await UserModel.addInteraction(currentLoggedUserID, userId);
        }

        return res.status(200).json({ success: true, });
      } else {
        return res.status(200).json({ success: true, });
      }

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
          deviceId: { type: types.string },
          email: { type: types.string },
          gender: { type: types.string },
          birthday: { type: types.string },
          pushToken: { type: types.string },
          password: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const {deviceId,  name, email, password, pushToken, about, gender, relationship, job, birthday, location,googleSignInAccount,googleSignInPhotoUrl } = req.body;
      var locationData = JSON.parse(location);
      var image = [];  
      
      if(googleSignInPhotoUrl!=null &&googleSignInPhotoUrl != "undefined"){
        image.push(googleSignInPhotoUrl)
      }      

      let bcryptedPassword = Bcrypt.hashSync(password, 10);
      console.log(googleSignInAccount)
      console.log(image)
      var user = await UserModel.createUser( deviceId, name, email, bcryptedPassword, pushToken, about, gender, relationship, job, birthday, locationData,googleSignInAccount,image);
      console.log(user)
      const payload = {
        userId: user._id,
        password: bcryptedPassword,
      };
      var editedUser = user.toObject()
      const authToken = jwt.sign(payload, SECRET_KEY);
      editedUser.interactions = 0
      // schedule.scheduleJob('my-job', '* * * * *', () => {
      //   notification('Deneme Title', 'Deneme Body', pushToken);
      // });
      return res.status(200).json({ success: true, authToken, "user": editedUser });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  login: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          deviceId: { type: types.string },
          email: { type: types.string },
          pushToken: { type: types.string },
          password: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json(validation);

      const { deviceId, email, password, pushToken } = req.body;

      var newUser = await UserModel.getUserByEmail(email)

      var user = newUser[0]
      if (user == null) {
        return res.status(200).json({ success: false, error: "No User Found" });
      } else {
        if (!Bcrypt.compareSync(password, user.password)) {
          return res.status(200).json({ success: false, error: "Wrong Password" });
        } else {

          let bcryptedPassword = Bcrypt.hashSync(password, 10);
          const payload = {
            userId: user._id,
            password: bcryptedPassword,
          };

          await UserModel.updateUserPushToken(user._id, pushToken)
          const authToken = jwt.sign(payload, SECRET_KEY);

          // schedule.scheduleJob('my-job','* * * * *',()=>{
          //   notification('Deneme Title','Deneme Body',pushToken);
          // });
          return res.status(200).json({ success: true, authToken, user });
        }

      }

    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  googleSignIn: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          deviceId: { type: types.string },
          pushToken: { type: types.string },
          email: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json(validation);
      const { deviceId,email,pushToken } = req.body;

      var newUser = await UserModel.getUserByEmail(email)
 
      var user = newUser[0]

      if (user == null) {
        return res.status(200).json({ success: true, error: "User not signed" });
      } else {
        await UserModel.updateUserPushToken(user._id, pushToken)
        const payload = {
          userId: user._id,
          password: user.googleSignAccount.accessToken,
        };
        const authToken = jwt.sign(payload, SECRET_KEY);
        return res.status(200).json({ success: true, authToken, user });
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
      var position = req.body.position;
      const userId = req.userId;
      console.log(req.file);
      var img = 'asdas';
      const user = await UserModel.updateUserPhoto(userId, img, position);
      if (user.n == 0) {
        return res.status(200).json({
          success: false,
        });
      } else {
        return res.status(200).json({
          success: true,
        });
      }

    } catch (error) {
      return res.status(500).send({
        error
      });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          gender: { type: types.string },
          birthday: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json(validation);
      const { relationship, about, gender, birthday, job } = req.body;
      var imagesPaths = []
      for (var i = 0; i < req.files.length; i++) {
        console.log(req.files[i])
        imagesPaths.push(req.files[i].path)
      }
      const userId = req.userId;
      const user = await UserModel.updateProfile(userId, imagesPaths, relationship, about, birthday, job, gender);
      var editedUser = user.toObject()
      editedUser.gifts = user.gifts.length;
      editedUser.interactions = user.interactions.length;
      console.log(editedUser)
      return res.status(200).json({
        success: true,
        "user": editedUser
      });
    } catch (error) {
      return res.status(500).send({
        error
      });
    }
  },

  purchaseStar: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          productId: { type: types.string },
          purchaseId: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json(validation);
      const { productId, purchaseId, } = req.body;
      const currentLoggedUserID = req.userId;
      // product Id Check
      var star = 3000;
      const user = await UserModel.incrementStar(currentLoggedUserID, star)
      if (user.n > 0) {
        return res.status(200).json({
          success: true,
          star
        });
      } else {
        return res.status(200).json({
          success: false,
          star: 0,
          error: "Error"
        });
      }

    } catch (error) {
      return res.status(500).send({
        error
      });
    }
  }, convertGift: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          id: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json(validation);
      const { id } = req.body;
      const currentLoggedUserID = req.userId;

      const updatedGift = await GiftModel.convertGift(id)
      console.log(updatedGift)
      if (updatedGift) {
        var sendedGift = gifts.filter((gift) => gift.giftId === parseInt(updatedGift.giftId))[0]
        var star = sendedGift.star / 1.5;
        return res.status(200).json({
          success: true,
          star
        });
      } else {
        return res.status(200).json({
          success: false,
          star: 0,
          error: "No gift found"
        });
      }

    } catch (error) {
      return res.status(500).send({
        error
      });
    }
  },
  sendGift: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          userId: { type: types.string },
          giftId: { type: types.string },
          roomId: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json(validation);
      const { userId, giftId, roomId } = req.body;
      const currentLoggedUserID = req.userId;

      const currentLoggedUser = await UserModel.getUserById(currentLoggedUserID);

      var sendedGift = gifts.filter((gift) => gift.giftId === parseInt(giftId))[0]
      console.log(sendedGift.star)
      console.log(currentLoggedUser[0].star)

      if (currentLoggedUser[0].star < sendedGift.star) {
        return res.status(200).json({
          success: false,
          error: "Insufficient Balance"
        });
      } else {

        await UserModel.incrementStar(currentLoggedUserID, -(sendedGift.star))
        await UserModel.incrementGift(userId)

        await GiftModel.addGift(currentLoggedUserID, userId, giftId);

        var post = await ChatMessageModel.createPostInChatRoom('', roomId, giftId, currentLoggedUserID, 'gift');

        global.io.sockets.in(roomId).emit('new message', { message: post });

        return res.status(200).json({
          success: true,
          post
        });
      }

    } catch (error) {
      return res.status(500).send({
        error
      });
    }
  },
  deletePhoto: async (req, res) => {
    try {
      var position = req.body.position;
      const userId = req.userId;
      const user = await UserModel.deleteUserPhoto(userId, position);
      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res.status(500).send({
        error
      });
    }
  },
}

var gifts = [{
  "giftId": 1,
  "star": 10
}, {
  "giftId": 2,
  "star": 25
}, {
  "giftId": 3,
  "star": 50
}, {
  "giftId": 4,
  "star": 100
}, {
  "giftId": 5,
  "star": 100
},
{
  "giftId": 6,
  "star": 250
}, {
  "giftId": 7,
  "star": 300
}, {
  "giftId": 8,
  "star": 500
}, {
  "giftId": 9,
  "star": 500
}, {
  "giftId": 10,
  "star": 750
}, {
  "giftId": 11,
  "star": 1500
}, {
  "giftId": 12,
  "star": 3000
},]