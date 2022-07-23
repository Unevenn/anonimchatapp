// utils
import makeValidation from '@withvoid/make-validation';
// models
import ChatRoomModel from '../models/ChatRoom.js';
import ChatMessageModel from '../models/ChatMessage.js';
import UserModel from '../models/User.js';

export default {
  initiate: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          userIds: { 
            type: types.array, 
            options: { unique: true, empty: false, stringOnly: true } 
          },
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const { userIds } = req.body;
      console.log(userIds)
      const { userId: chatInitiator } = req;
      const allUserIds = [...userIds, chatInitiator];
      const chatRoom = await ChatRoomModel.initiateChat(allUserIds, chatInitiator);
      return res.status(200).json({ success: true, chatRoom });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  postMessage: async (req, res) => {
    try {
      const { roomId,pushToken } = req.params;
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          messageText: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });
      var  messageText = req.body.messageText;
      const currentLoggedUser = req.userId;
      const post = await ChatMessageModel.createPostInChatRoom(roomId, messageText, currentLoggedUser);
      global.io.sockets.in(roomId).emit('new message', { message: post });
      return res.status(200).json({ success: true, post });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getRecentConversation: async (req, res) => {
    try {
      const currentLoggedUser = req.userId;
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const rooms = await ChatRoomModel.getChatRoomsByUserId(currentLoggedUser);
      const roomIds = rooms.map(room => room._id);
      var recentConversation = await ChatRoomModel.getRecentConversation(
        roomIds, options, currentLoggedUser
      );
      return res.status(200).json({ success: true, conversations: recentConversation });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getConversationByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }
      const users = await UserModel.getUserByIds(room.userIds);
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const conversation = await ChatMessageModel.getConversationByRoomId(roomId, options);
      console.log(conversation)
      return res.status(200).json({
        success: true,
        conversation,
        users,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },
  getChatRoomById: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }

      return res.status(200).json({
        success: true,
        room
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },
  getMessagesByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const messages = await ChatMessageModel.getMessagesByRoomId(roomId, options);
      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },
  getUndeliveredMessagesByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      console.log(req.userId)
      const messages = await ChatMessageModel.getUndeliveredMessagesByRoomId(roomId, req.userId, options);
      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },
  markConversationReadByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }

      const currentLoggedUser = req.userId;
      const result = await ChatMessageModel.markMessageRead(roomId, currentLoggedUser);
      try {
        global.io.sockets.in(roomId).emit('read message', { roomId,currentLoggedUser});
      } catch (error) {
        print(error);
      }

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    }
  },
  markConversationDeliveredByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }

      const currentLoggedUser = req.userId;
      const result = await ChatMessageModel.markMessageDelivered(roomId, currentLoggedUser);
      global.io.sockets.in(roomId).emit('delivered message', { roomId,currentLoggedUser});
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    }
  },
  markMessageRead: async (req, res) => {
    try {
      const { messageId } = req.params;
      const currentLoggedUser = req.userId;
      const result = await ChatMessageModel.markSingleMessageRead(messageId, currentLoggedUser);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    }
  },
  markMessageDelivered: async (req, res) => {
    try {
      const { messageId } = req.params;
      const currentLoggedUser = req.userId;
      const result = await ChatMessageModel.markSingleMessageDelivered(messageId, currentLoggedUser);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    }
  },
}