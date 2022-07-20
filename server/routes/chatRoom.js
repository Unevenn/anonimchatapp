import express from 'express';
// controllers
import chatRoom from '../controllers/chatRoom.js';

const router = express.Router();

router
  .get('/', chatRoom.getRecentConversation)
  .get('/:roomId', chatRoom.getConversationByRoomId)
  .post('/initiate', chatRoom.initiate)
  .post('/:roomId/message', chatRoom.postMessage)
  .get('/:roomId/getMessages', chatRoom.getMessagesByRoomId)
  .get('/:roomId/getRoom', chatRoom.getChatRoomById)
  .get('/:roomId/getUnDeliveredMessages', chatRoom.getUndeliveredMessagesByRoomId)
  .put('/:roomId/mark-read', chatRoom.markConversationReadByRoomId)
  .put('/:roomId/mark-delivered', chatRoom.markConversationDeliveredByRoomId)
  .put('/:messageId/mark-read-single', chatRoom.markMessageRead)
  .put('/:messageId/mark-delivered-single', chatRoom.markMessageRead)

export default router;
