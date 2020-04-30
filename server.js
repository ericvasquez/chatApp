const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");


const app = express();
const server = http.createServer((app));
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

const chatHost = "Chat Host";

//Run when user connects
io.on("connection", socket => {
   socket.on("joinRoom", ({ username, room }) => {

    const user = userJoin(socket.id, username, room);
socket.join(user.room);

//Welcome user
//socket.emit emits to individual
socket.emit("message", formatMessage(chatHost, "welcome to chat"));

//Broadcast when a user connects
//Broadcast emits to everyone but the user
    socket.broadcast.to(user.room).emit("message", formatMessage(chatHost,`${user.username} has joined the chat`));
//Send users and room info
io.to(user.room).emit("roomUsers", {
    room: user.room,
    users: getRoomUsers(user.room)
});
   });
    
//Listen for chat message     msg is a parameter for function
socket.on("chatMessage", msg => {
    const user = getCurrentUser(socket.id);
//emit to everyone
    io.to(user.room).emit("message", formatMessage(user.username, msg));
});

//Runs when user disconnects
socket.on("disconnect", () => {

    const user =userLeave(socket.id);
    if(user){
            io.emit("message", formatMessage(chatHost, `${user.username} has left the chat`));

    }
});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));