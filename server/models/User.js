import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
export const USER_TYPES = {
  CONSUMER: "consumer",
  SUPPORT: "support",
};

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    name: {
      type:String,
      required:true,
    },
    email: {
      type:String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true
    }, 
    password: {
      type:String,
      required:true,
    },lastSeen:{
      type: Date,
      default: Date.now(),
    },
    image:{
      type:String,
      default: ''
    },
    pushToken:{
      type:String,
      required:true,
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
userSchema.statics.createUser = async function (name, email, password,pushToken) {
  try {
    const user = await this.create({ name, email, password,pushToken});
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
  try {
    const user = await this.findOne({ _id: id }).select("-password");
    if (!user) throw ( 'No user with this id found' );
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.getUserByEmail = async function (email) {
  try {
    const user = await this.findOne({ email: email });
    if (!user) throw (  'No user with this email found' );
    return user;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.getUserLastSeen = async function (userId) {
  try {
    const user = await this.findOne({ _id: userId },
      { "lastSeen": true ,"_id" :false},
   );
    if (!user) throw (  'No user with this id found' );
    return user;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateUserLastSeen = async function (userId) {
  try {
    const user = await this.updateOne({ _id: userId,},
      {
        $set: {
          "lastSeen": Date.now()
      },
        },  
   );
    if (!user) throw (  'No user with this id found' );
    return user.lastSeen;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateUserPushToken = async function (userId,pushToken) {
  try {
    const user = await this.updateOne({ _id: userId,},
      {
        $set: {
          "pushToken":pushToken
      },
        },  
   );
    if (!user) throw (  'No user with this id found' );
    return user.lastSeen;
  } catch (error) {
    throw error;
  }
}
userSchema.statics.updateUserPhoto = async function (userId,image) {
  try {
    
    const user = await this.updateOne({ _id: userId,},
      {
        $set: {
          "image": image
      },
        },  
   );
    if (!user) throw (  'No user with this id found' );
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * @return {Array} List of all users
 */
userSchema.statics.getUsers = async function () {
  try {
    const users = await this.find();
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
