import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const storyImageSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => uuidv4().replace(/\-/g, ""),
        },
        imgData: {
            type: String,
            required: true,
        },
        imgType: {
            type: String,
            required: true,
        },
        see: {
            type: Array,
            default: []
        }, createdDate: {
            type: Date,
            default: Date.now()
        }
    },
    {
        timestamps: false,
        collection: "storyImages",
    }
);
storyImageSchema.statics.createStoryImage = async function (imgData, imgType,) {
    try {
        const storyImage = await this.create(
            {
                imgData, imgType
            }
        )
        return storyImage;
    } catch (error) {
        throw error;
    }
}
storyImageSchema.statics.markSee = async function (userId, storyId,) {
    try {
        const storyImage = await this.updateOne(
            { _id: storyId },
            { $addToSet: { see: userId } }
        )
        return storyImage;
    } catch (error) {
        throw error;
    }
}
export default mongoose.model("StoryImages", storyImageSchema);