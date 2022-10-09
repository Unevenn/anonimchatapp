import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    deviceId: {
      type: String,
      required: true,
    },
    googleSignAccount: {
      type: Map,
      default: null
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    star: {
      type: Number,
      default: 0
    },
    password: {
      type: String,
      required: true,
    }, lastSeen: {
      type: Date,
      default: Date.now(),
    },
    image: {
      type: Array,
      default: []
    },
    interactions: {
      type: Array,
      default: []
    },
    pushToken: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      default: ''
    }, job: {
      type: String,
      default: ''
    },
    birthday: {
      type: Date,
      required: true,
    },
    location: {
      type: Map,
      default: null
    },
    gifts: {
      type: Number,
      default: 0
    },
    subscribeStatus: {
      type: String,
      default: "None"
    },
    banned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: "users",
  }
);

/**
 * @param {String} firstName
 * @param {String} lastName
 * @returns {Object} new user object created
 */
userSchema.statics.createUser = async function (deviceId, name, email, password, pushToken, about, gender, relationship, job, birthday, location, googleSignAccount, image) {
  try {
    const user = await this.create({ deviceId, name, email, password, pushToken, about, gender, relationship, job, birthday, location, googleSignAccount, image });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} id, user id
 * @return {Object} User profile object
 */
userSchema.statics.getUserById = async function (id) {
  var y = new Date(); // yesterday!]
  var t = new Date(); // today!
  var x = 1; // go back 1 days!
  y.setDate(t.getDate() - x);
  try {

    const user = this.aggregate([

      { $match: { _id: id, } },

      {
        $addFields: {
          interactions: {
            $size:
            {
              $filter: {
                input: "$interactions",
                as: "interaction",
                cond:

                 { $gte: [ "$$interaction.date", y ] }
             

              }
            }

          },
        }
      },])

    if (!user) throw ('No user with this id found');

    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.getUserByEmail = async function (email) {
  try {
    const user = this.aggregate([
      { $match: { email: email } },

      {
        $addFields: {
          interactions: { $size: "$interactions" },
        }
      },
    ])
    return user;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.getUserLastSeen = async function (userId) {
  try {
    const user = await this.findOne({ _id: userId },
      { "lastSeen": true, "_id": false },
    );
    if (!user) throw ('No user with this id found');
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateUserLastSeen = async function (userId) {
  try {
    const user = await this.updateOne({ _id: userId, },
      {
        $set: {
          "lastSeen": Date.now()
        },
      },
    );
    if (!user) throw ('No user with this id found');
    return user.lastSeen;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateUserPushToken = async function (userId, pushToken) {
  try {
    const user = await this.updateOne({ _id: userId, },
      {
        $set: {
          "pushToken": pushToken
        },
      },
    );
    if (!user) throw ('No user with this id found');
    return user.lastSeen;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.incrementStar = async function (currentLoggedUserID, star) {
  try {
    const user = await this.updateOne({ _id: currentLoggedUserID, },
      {
        $inc: {
          "star": star
        },
      },
    );
    if (!user) throw ('No user with this id found');
    return user;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.updatePremium = async function (currentLoggedUserID, productId) {
  try {
    const user = await this.updateOne({ _id: currentLoggedUserID, },
      {
        $set: {
          "$subscribeStatus": productId
        },
      },
    );
    if (!user) throw ('No user with this id found');
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.incrementGift = async function (currentLoggedUserID,) {
  try {
    const user = await this.updateOne({ _id: currentLoggedUserID, },
      {
        $inc: {
          "gifts": 1
        },
      }
    );
    if (!user) throw ('No user with this id found');
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateProfile = async function (userId, images, relationship, about, birthday, job, gender,) {
  try {
    const user = await this.findOneAndUpdate({ _id: userId, },
      {
        $set: {
          "image": images,
          "relationship": relationship,
          "about": about,
          "birthday": birthday,
          "job": job,
          "gender": gender,
        },
      },


    );
    if (!user) throw ('No user with this id found');
    return user;
  } catch (error) {
    throw error;
  }
}


userSchema.statics.updateUserPhoto = async function (userId, image, position) {
  try {
    console.log(position)
    if (position == 0) {
      const user = await this.updateOne({ _id: userId, },
        {
          $set:
          {
            "image.0": image,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    } else if (position == 1) {
      const user = await this.updateOne({ _id: userId, },
        {
          $set:
          {
            "image.1": image,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    }
    else if (position == 2) {
      const user = await this.updateOne({ _id: userId, },
        {
          $set:
          {
            "image.2": image,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    }
    else if (position == 3) {
      const user = await this.updateOne({ _id: userId, },
        {
          $set:
          {
            "image.3": image,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    } else if (position == 4) {
      const user = await this.updateOne({ _id: userId, },
        {
          $set:
          {
            "image.4": image,
          }
        },

      );
      if (!user) throw ('No user with this id found');
      return user;
    }


  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateUserLastSeen = async function (userId) {
  try {
    const user = await this.updateOne({ _id: userId, },
      {
        $set: {
          "lastSeen": Date.now()
        },
      },
    );
    if (!user) throw ('No user with this id found');
    return user.lastSeen;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateUserPushToken = async function (userId, pushToken) {
  try {
    const user = await this.updateOne({ _id: userId, },
      {
        $set: {
          "pushToken": pushToken
        },
      },
    );
    if (!user) throw ('No user with this id found');
    return user.lastSeen;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.deleteUserPhoto = async function (userId, position) {
  try {
    console.log(position)
    if (position == 0) {
      const user = await this.updateOne({ _id: userId, },
        {
          $unset:
          {
            "image.0": 1,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    } else if (position == 1) {
      const user = await this.updateOne({ _id: userId, },
        {
          $unset:
          {
            "image.1": 1,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    }
    else if (position == 2) {
      const user = await this.updateOne({ _id: userId, },
        {
          $unset:
          {
            "image.2": 1,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    }
    else if (position == 3) {
      const user = await this.updateOne({ _id: userId, },
        {
          $unset:
          {
            "image.3": 1,
          }
        },
      );
      if (!user) throw ('No user with this id found');
      return user;
    } else if (position == 4) {
      const user = await this.updateOne({ _id: userId, },
        {
          $unset:
          {
            "image.4": 1,
          }
        },

      );
      if (!user) throw ('No user with this id found');
      return user;
    }


  } catch (error) {
    throw error;
  }
}

/**
 * @return {Array} List of all users
 */
userSchema.statics.getUsers = async function () {
  try {
    const users = await this.find().select("-password").select("-gifts").select("-interactions");
    return users;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.checkInteraction = async function (currentLoggedUserID, userId) {
  var date = new Date()
  try {
    return await this.update(
      {
        _id: userId,
        interactions: {
          $elemMatch: { userId: { $eq: currentLoggedUserID } }
        }
      },
      {
        $set: { "interactions.$.date": date }
      },
    );

  } catch (error) {
    throw error;
  }
}
userSchema.statics.addInteraction = async function (currentLoggedUserID, userId) {
  var date = new Date()
  try {
    return await this.update(
      {
        _id: userId,
      },
      {
        $push: {
          interactions: {
            "date": date,
            "userId": currentLoggedUserID
          }
        }

      }
    );

  } catch (error) {
    throw error;
  }
}

userSchema.statics.getInteractions = async function (userId) {
  var y = new Date(); // yesterday!]
  var t = new Date(); // today!
  var x = 1; // go back 1 days!
  y.setDate(t.getDate() - x);
  try {
    return this.aggregate([
      { $match: { _id: userId, "interactions.date": { $gte: y, $lt: t } } },

      {
        $lookup: {
          from: "users",
          localField: "interactions.userId",
          foreignField: "_id",
          pipeline: [
            {
              $addFields: {
                interactions: { $size: "$interactions" },

              }
            },
          ],
          as: "interactions"
        }
      },

      {
        $project: {
          interactions: "$interactions",
        }

      },

    ])
  } catch (error) {
    throw error;
  }
}
userSchema.statics.convertGift = async function (userId, senderDate) {

  var date = new Date(senderDate)
  console.log(date)
  try {
    return await this.findOne(
      {
        _id: userId,
        "interactions.date": { "$gte": date }
      },

    );

  } catch (error) {
    throw error;
  }
}
userSchema.statics.getGifts = async function (userId) {

  try {
    return this.aggregate([
      { $match: { _id: userId, } },

      { $unwind: '$gifts' },
      {
        $lookup: {
          from: "users",
          localField: "gifts.senderId",
          foreignField: "_id",
          pipeline: [

            { "$project": { "name": 1, "email": 1, "image": 1 } }
          ],
          as: "gifts.senderUser"
        }
      },
      {
        $project: {
          _id: 0,
          gifts: "$gifts",

        }
      }, {
        $sort: { "gifts.senderDate": -1 }
      },
      { $group: { _id: null, gifts: { $push: '$gifts' } } }
      , { $unset: "gifts.senderId" }

    ])
  } catch (error) {
    throw error;
  }
}
userSchema.statics.searchUsers = async function (searchText) {
  try {
    const users = await this.find(
      { $text: { $search: searchText } }
    );
    return users;
  } catch (error) {
    throw error;
  }
}
/**
 * @param {Array} ids, string of user ids
 * @return {Array of Objects} users list
 */
userSchema.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } });
    return users;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} id - id of user
 * @return {Object} - details of action performed
 */
userSchema.statics.deleteByUserById = async function (id) {
  try {
    const result = await this.remove({ _id: id });
    return result;
  } catch (error) {
    throw error;
  }
}

export default mongoose.model("User", userSchema);
