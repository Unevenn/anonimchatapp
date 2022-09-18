import express from "express";
import logger from "morgan";
import cors from "cors";
import mongoose from 'mongoose'
import socketio from "socket.io";
// mongo connection
import url from "./config/mongo.js";
// socket configuration
import WebSockets from "./utils/WebSockets.js";
// routes
import indexRouter from "./routes/index.js";
import userRouter from "./routes/user.js";

import chatRoomRouter from "./routes/chatRoom.js";
import deleteRouter from "./routes/delete.js";
import storyRouter from "./routes/story.js";
// middlewares
import { decode } from './middlewares/jwt.js'
import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import options from './admin/admin.options.js';
import path from 'path';


const app = express();
const port = process.env.PORT || "3000";
app.set("port", port);


const adminJS = new AdminJS(options)

const router = AdminJSExpress.buildRouter(adminJS)




app.use(adminJS.options.rootPath, router)
app.use(logger("dev"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/room", decode, chatRoomRouter);
app.use("/story", decode, storyRouter);
app.use("/delete", deleteRouter);
app.get(/^(.+)$/, function(req, res){ 
  const __dirname = path.resolve();
  res.sendfile( __dirname + req.params[0]); 
});

app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    error: 'API endpoint doesnt exist'
  })
});

const server = app.listen(port, () => {
  console.log("Listening on port: " + port);
});
global.io = socketio.listen(server);
global.io.on('connection', WebSockets.connection)