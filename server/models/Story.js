import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const storySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        images: {
            type: Array,
            default: []
        }
    },
    {
        timestamps: false,
        collection: "stories",
    }
);



storySchema.statics.createStory = async function (userId, storyImageId) {

    try {
        const stories = await this.findOne({
            userId
        });
        if (stories) {
            const story = await this.updateOne(
                { 'userId': userId },
                { $push: { images: storyImageId } }
            )
            return story;
        } else {
            var images = [storyImageId]
            console.log(images)
            const story = await this.create(
                {
                    userId,
                    images
                }

            )
            return story;
        }

    } catch (error) {
        throw error;
    }
}
storySchema.statics.deleteStory = async function (_id,) {
    try {
        const story = await this.deleteOne({ _id, });
        return story;
    } catch (error) {
        throw error;
    }
}
storySchema.statics.getStories = async function (userId) {
    var d = new Date(); // today!]
    var s = new Date(); // today!
    var x = 1; // go back 5 days!
    d.setDate(d.getDate() - x);
    try {
        return this.aggregate([
            {
                $lookup: {
                    from: "storyImages",
                    localField: 'images',
                    foreignField: "_id",
                    let: { "date": "$createdDate" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $not: {
                                        $in: [
                                          userId,
                                          "$see"
                                        ]
                                      }
                                  
                                  },
                                createdDate: { $gte:d, $lt: s }
                            },

                        },
                        { "$sort": { "createdDate": 1 } },
                    ],
                    as: "stories"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: 'userId',
                    foreignField: "_id",
                    pipeline: [
                  
                        { "$project": { "banned": 0, "password": 0,"pushToken":0,"updatedAt":0 ,"__v":0,"subscribeStatus":0,"gifts":0,"interactions":0,"star":0}}
                      ],
                    as: "user"
                }
            },
            {
                $project: {

                    _id: "$_id",
                    user: "$user",
                    stories: "$stories",
                    moreThanFive: { $gt: [{ $size: "$images" }, 0] },
                    storiesMoreThanOne: { $gt: [{ $size: "$stories" }, 0] }
                }
            },
            { $match: { moreThanFive: true } },
            { $match: { storiesMoreThanOne: true } },
            { $unset: "moreThanFive" },
            { $unset: "storiesMoreThanOne" },

        ]);
    } catch (error) {
        throw error;
    }
}
storySchema.statics.getUserStories = async function (userId) {
    var d = new Date(); // today!]
    var s = new Date(); // today!
    var x = 1; // go back 5 days!
    d.setDate(d.getDate() - x);
    try {
        return this.aggregate([
            { $match: { userId: userId } },
            {


                $lookup: {
                    from: "storyImages",
                    localField: 'images',
                    foreignField: "_id",
                
                    as: "stories"
                }
            },
            {
                $project: {

                    _id: "$_id",
                    stories: "$stories",
                    moreThanFive: { $gt: [{ $size: "$images" }, 0] },
                    storiesMoreThanOne: { $gt: [{ $size: "$stories" }, 0] }
                }
            },
            { $match: { moreThanFive: true } },
            { $match: { storiesMoreThanOne: true } },
            { $unset: "moreThanFive" },
            { $unset: "storiesMoreThanOne" },

        ]);
    } catch (error) {
        throw error;
    }
}
export default mongoose.model("Story", storySchema);