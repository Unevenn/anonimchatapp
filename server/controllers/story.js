import makeValidation from '@withvoid/make-validation';
import StoryModel from '../models/Story.js';
import StoryImages from '../models/StoryImages.js';
export default {
    getStories: async (req, res) => {
        try {
            var userId = req.userId;
            const stories = await StoryModel.getStories(userId)

            return res.status(200).json({ success: true, stories });
        } catch (error) {
            return res.status(500).json({ success: false, error: error })
        }
    }, getUserStories: async (req, res) => {
        try {
            var userId = req.userId;
            const stories = await StoryModel.getUserStories(userId)

            return res.status(200).json({ success: true, stories });
        } catch (error) {
            return res.status(500).json({ success: false, error: error })
        }
    },
    markSee: async (req, res) => {
        try {
            var userId = req.userId;
            console.log(userId);

            var storyId = req.params.storyId;
            console.log(storyId);
            const stories = await StoryImages.markSee(userId, storyId)

            return res.status(200).json({ success: true, stories });
        } catch (error) {
            return res.status(500).json({ success: false, error: error })
        }
    },
    addStory: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    fileType: { type: types.string },
                }
            }));
            if (!validation.success) return res.status(400).json({ ...validation });
            const { fileType } = req.body;

            if (req.file) {
                var img = req.file.path
                var userId = req.userId;
                const storyImage = await StoryImages.createStoryImage(img, fileType);
                await StoryModel.createStory(userId, storyImage._id);
                return res.status(200).json({ success: true, });
            } else {
                return res.status(200).json({ success: false, "error": "No File" });
            }

        } catch (error) {
            return res.status(500).json({ success: false, error: error })
        }
    },
    deleteStory: async (req, res) => {
        try {
            const storyId = req.params.storyId;
            await StoryModel.deleteStory(storyId)
            return res.status(200).json({ success: true, });
        } catch (error) {
            return res.status(500).json({ success: false, error: error })
        }
    }
}
