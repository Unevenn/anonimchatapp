import express from 'express';
// controllers
import story from '../controllers/story.js';

import upload from "../middlewares/upload.js";


const router = express.Router();

router
  .get('/', story.getStories)
  .get('/getUserStories', story.getUserStories)
  .post('/addStory',upload.single("file"), story.addStory)
  .put('/:storyId/markSee', story.markSee)
  .delete('/:storyId/deleteStory', story.deleteStory)

export default router;

