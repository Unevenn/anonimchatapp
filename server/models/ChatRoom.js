import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";


const chatRoomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    userIds: Array,
    chatInitiator: String,
  },
  {
    timestamps: true,
    collection: "chatrooms",
  }
);

/**
 * @param {String} userId - id of user
 * @return {Array} array of all chatroom that the user belongs to
 */
chatRoomSchema.statics.getChatRoomsByUserId = async function (userId) {
  try {
    const rooms = await this.find({ userIds: { $all: [userId] } });
    return rooms;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  try {
    const room = await this.findOne({ _id: roomId }).select('-__v');
    return room;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Array} userIds - array of strings of userIds
 * @param {String} chatInitiator - user who initiated the chat
 */
chatRoomSchema.statics.initiateChat = async function (userIds, chatInitiator) {
  try {
    const chatroom = await this.findOne({
      userIds: {
        $size: userIds.length,
        $all: [...userIds],
      },
    });
    if (chatroom) {
      return chatroom;
      return {
        isNew: false,
        message: 'retrieving an old chat room',
        chatroom
      };
    }

    const newRoom = await this.create({ userIds, chatInitiator });
    return newRoom;
    return {
      isNew: true,
      message: 'creating a new chatroom',
      chatroom: newRoom
    };
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
}

chatRoomSchema.statics.getRecentConversation = async function (chatRoomIds, options, currentUserOnlineId) {
  console.log(currentUserOnlineId);
  try {
    return this.aggregate([
      { $match: { _id: { $in: chatRoomIds } } },
      { $unset: "__v" },
      {
        $lookup: {
          from: 'chatmessages',
          localField: '_id',
          foreignField: 'chatRoomId',
          pipeline: [
            {
              $sort: {
                createdAt: -1
              }
            }, { $unset: "__v" },
            {
              $match: {
                'readByRecipients.readByUserId': { $nin: [currentUserOnlineId] },
             
              }
            }
          ],
          as: 'messages',
        },
      },
      {
        $project: {
          messages: "$messages",
          userIds: "$userIds",
          chatInitiator: "$chatInitiator",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          moreThanFive: { $gt: [{ $size: "$messages" }, 0] }
        }
      },




      { $match: { moreThanFive: true } },
      { $unset: "moreThanFive" },

      // {
      //   $group: {
      //     _id: '$chatRoomId',
      //     messageId: { $last: '$_id' },
      //     chatRoomId: { $last: '$chatRoomId' },
      //     message: { $last: '$message' },
      //     type: { $last: '$type' },
      //     postedByUser: { $last: '$postedByUser' },
      //     createdAt: { $last: '$createdAt' },
      //     readByRecipients: { $last: '$readByRecipients' },
      //   }
      // },

      // { $sort: { createdAt: -1 } },
      // // do a join on another table called users, and 
      // // get me a user whose _id = postedByUser

      // { $unwind: "$postedByUser" },
      // // do a join on another table called chatrooms, and 
      // // get me room details
      // {
      //   $lookup: {
      //     from: 'chatrooms',
      //     localField: '_id',
      //     foreignField: '_id',
      //     as: 'roomInfo',
      //   }
      // },
      // { $unwind: "$roomInfo" },
      // { $unwind: "$roomInfo.userIds" },
      // // do a join on another table called users 
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'roomInfo.userIds',
      //     foreignField: '_id',
      //     as: 'roomInfo.userProfile',
      //   }
      // },
      // { $unwind: "$readByRecipients" },
      // // do a join on another table called users 
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'readByRecipients.readByUserId',
      //     foreignField: '_id',
      //     as: 'readByRecipients.readByUser',
      //   }
      // },

      // {
      //   $group: {
      //     _id: '$roomInfo._id',
      //     messageId: { $last: '$messageId' },
      //     chatRoomId: { $last: '$chatRoomId' },
      //     message: { $last: '$message' },
      //     type: { $last: '$type' },
      //     postedByUser: { $last: '$postedByUser' },
      //     readByRecipients: { $addToSet: '$readByRecipients' },
      //     roomInfo: { $addToSet: '$roomInfo.userProfile' },
      //     createdAt: { $last: '$createdAt' },
      //   },
      // },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
    ]);
  } catch (error) {
    throw error;
  }
}
export default mongoose.model("ChatRoom", chatRoomSchema);
