import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const giftSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
            required: true,
        },
        receiverId: {
            type: String,
            required: true,
        },
        giftId: {
            type: String,
            required: true,
        },
        converted: {
            type: Boolean,
            default: false
        },
        senderDate: {
            type: Date, 
            default: Date.now()
        },
    },
    {
        timestamps: false,
        collection: "gifts",
    }
);



giftSchema.statics.addGift = async function (senderId, receiverId, giftId,) {
    try {
        const gift = await this.create({ senderId: senderId, receiverId: receiverId ,giftId:giftId});
        return gift;
    } catch (error) {
        throw error;
    }
}
giftSchema.statics.getGifts = async function (receiverId) {
    try {
        return this.aggregate([
            { $match: { receiverId: receiverId, } },
            {
                $sort: { "senderDate": -1 }
              },
              {
                $lookup: {
                  from: "users",
                  localField: "senderId",
                  foreignField: "_id",
                  pipeline: [
                  
                    { "$project": { "banned": 0, "password": 0,"pushToken":0,"updatedAt":0 ,"__v":0,"subscribeStatus":0,"gifts":0,"interactions":0,"star":0}}
                  ],
                  as: "senderUser"
                }
              },
              { $unset: "senderId", } ,
              { $unset: "__v", } 
        
 
      
          ])
        const gifts = await this.find({"receiverId":receiverId});
        return gifts
    } catch (error) {
        throw error;
    }
}
giftSchema.statics.convertGift = async function (id) {
    try {
        const gift = await this.findOneAndUpdate({ _id: id, },
            {
                $set: {
                    "converted": true
                },
            },);
        return gift
    } catch (error) {
        throw error;
    }
}
export default mongoose.model("Gift", giftSchema);