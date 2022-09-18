import UserModel from '../models/User.js';
import ChatMessageModel from '../models/ChatMessage.js';
import jwt from 'jsonwebtoken';
import FCM from 'fcm-node';

const SECRET_KEY = 'some-secret-key';
var fbServerKey = 'AAAA9dwQnKo:APA91bEoo8bVKUbqj9TzcFvhN4Ek0Te66pnHiFd9KOXlvNlaEDeIxHd52ZnNRIcfawSm3jSxyqLs2VcnQLd9bMGzazQxi6eYP71B5GthFTwizA8k4oqqYegHODK5HX_lpmivOit4DzZo';
let users = [];

class WebSockets {

  connection(client) {
    client.on("disconnect", () => {
      users.map((user) => {
        if (user.socketId === client.id) {
          UserModel.updateUserLastSeen(user.userId);
          var data = { "userId": user.userId, 'status': Date.now() };
          client.in(user.userId).emit('getlastseen', { data });
          return true;
        }
      })
      users = users.filter((user) => user.socketId !== client.id);
    });
    // add identity of user mapped to the socket id
    client.on("identity", (userId) => {
      users = users.filter((user) => user.socketId !== client.id);

      users.push({
        socketId: client.id,
        userId: userId,
        backgorund: false,
      });
    });

    client.on("send message", (post, authToken, pushToken) => {
      var messageText = post['message'];
      var id = post['_id'];
      var roomId = post['chatRoomId'];
      var type = post['type'];
      console.log(type)
      try {

        const decoded = jwt.verify(authToken, SECRET_KEY);
        var currentLoggedUser = decoded.userId;
        post['createdAt'] = new Date().toISOString();
        post['updatedAt'] = new Date().toISOString();
        global.io.sockets.in(roomId).emit('new message', { message: post });
        var fcm = new FCM(fbServerKey);

        if (type == 'image' || type == 'voice') {
          post['message'] = type;
          var message = {
            to: pushToken,
            data: { //you can send only notification or only data(or include both)
              post,
            }
          };

        } else {
          var message = {
            to: pushToken,
            data: { //you can send only notification or only data(or include both)
              post,
            }
          };
        } fcm.send(message, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!" + err);
            console.log("RAhmeespponse:! " + response);
          } else {
            // showToast("Successfully sent with response");
            console.log("Successfully sent with response: ", response);
          }
        });

        if (type == 'image' || type == 'voice') {
          messageText = new Buffer.from(post['message'], "base64");
        }
        ChatMessageModel.createPostInChatRoom(id, roomId, messageText, currentLoggedUser, type);
      } catch (error) {
        console.log(error)
      }
    });

    client.on("checklastseen", async (userId) => {
      console.log(userId);
      var onlineMi = users.map((user) => user.userId === userId && user.backgorund == false).includes(true);

      try {
        if (onlineMi) {
          var data = { "userId": userId, 'status': "online" };
          client.join(userId);
          global.io.sockets.to(client.id).emit('getlastseen', { data });
        } else {
          // son gorulmeyi cek ve gonder
          client.join(userId);
          const user = await UserModel.getUserLastSeen(userId);
          var data = { "userId": userId, 'status': user.lastSeen };
          global.io.sockets.to(client.id).emit('getlastseen', { data });
        }
      } catch (error) {
        console.log(error);
      }
    });
    client.on("updatelastseen", async (data) => {
      var userId = data['userId'];
      var status = data['status'];
      if (status == 'online') {
        var user = users.find(user => user.userId === userId)
        user.backgorund = false
        console.log("background mode close")
        var data = { "userId": userId, 'status': 'online' };

        client.in(userId).emit('getlastseen', { data });
      } else {
        var user = users.find(user => user.userId === userId)
        user.backgorund = true
        console.log("background mode open")

        var data = { "userId": userId, 'status': Date.now() };
        client.in(userId).emit('getlastseen', { data });
        UserModel.updateUserLastSeen(userId);
      }
    });

    client.on("typing", (data) => {
      // this.subscribeOtherUser(room, otherUserId);
      var data = { "userId": data['userId'], 'typing': data['typing'] };
      client.broadcast.emit('receive-typing', data);
      // global.io.sockets.in(room).emit('new message', { message: 'sad' });
    });
    // subscribe person to chat & other user as well
    client.on("subscribe", (data) => {
      // this.subscribeOtherUser(room, otherUserId);
      var chatroomIds = data['chatroomIds']
      client.join(chatroomIds);
      // global.io.sockets.in(room).emit('new message', { message: 'sad' });
    });
    // mute a chat room
    client.on("unsubscribe", (room) => {
      client.leave(room);
    });
  }

  subscribeOtherUser(room, otherUserId) {
    const userSockets = users.filter(
      (user) => user.userId === otherUserId
    );
    userSockets.map((userInfo) => {
      const socketConn = global.io.sockets.connected(userInfo.socketId);
      if (socketConn) {
        socketConn.join(room);
      }
    });
  }
}

export default new WebSockets();
