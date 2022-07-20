import UserModel from '../models/User.js';
import ChatMessageModel from '../models/ChatMessage.js';
let users = []; 
class WebSockets {

 

  connection(client) {
    client.on("disconnect", () => {
      users.map((user) => 
      {
        if(user.socketId === client.id){
          UserModel.updateUserLastSeen(user.userId);
          var data = {"userId": user.userId, 'status':Date.now()};
          client.in(user.userId).emit('getlastseen', { data });
          return true;
        }
      })
      users =  users.filter((user) => user.socketId !== client.id);
    });
    // add identity of user mapped to the socket id
    client.on("identity", (userId) => {   
      users =  users.filter((user) => user.socketId !== client.id);
     
        users.push({
          socketId: client.id,
          userId: userId,
        });
    });

    client.on("checklastseen", async (userId)  => {
      console.log(users);
     var onlineMi = users.map((user) => user.userId === userId).includes(true);
     try {
      if(onlineMi){    
        var data = {"userId": userId, 'status':"online"};
        client.join(userId);
        global.io.sockets.in(client.id).emit('getlastseen', { data});
      }else{
        // son gorulmeyi cek ve gonder
       client.join(userId);
       const user =  await UserModel.getUserLastSeen(userId);
        var data = {"userId": userId, 'status':user.lastSeen};
        global.io.sockets.in(client.id).emit('getlastseen', { data });
      }
     } catch (error) {
      console.log(error);
     }
    });
    client.on("updatelastseen", async (data) => {
      var userId = data['userId'];
      var status= data['status']; 
      if(status=='online'){
        var data = {"userId": userId, 'status':'online'};
        client.in(userId).emit('getlastseen', { data });
      }else{

        var data = {"userId": userId, 'status':Date.now()};
        client.in(userId).emit('getlastseen', { data });
         UserModel.updateUserLastSeen(userId);
      }
     });

     client.on("typing", (data) => {
      // this.subscribeOtherUser(room, otherUserId);
      var data = {"userId": data['userId'], 'typing':data['typing']};
      client.broadcast.emit('receive-typing', data);
      // global.io.sockets.in(room).emit('new message', { message: 'sad' });
    });
    // subscribe person to chat & other user as well
    client.on("subscribe", (room, otherUserId = "") => {
      // this.subscribeOtherUser(room, otherUserId);
      client.join(room);
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
