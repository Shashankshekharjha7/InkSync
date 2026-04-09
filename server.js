import express from "express";

import {createServer} from "http";
import { Server } from "socket.io";

import path from "path";
import {fileURLToPath} from "url";


const app = express()
const server = createServer(app);

const io = new Server(server);

const __filename  = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req,res) => {
  res.sendFile(path.join(__dirname, "index.html"));
})

io.on("connection", (socket) => {
  console.log("a user connected", socket.id)

  socket.on("message", (value) => {
    if(!socket.username) return; // prevent messages without username

    console.log("message received:", value)
    io.to(socket.room).emit("message", {username: socket.username, text: value})
    
  });

  socket.on("join", ({username, room}) => {
    socket.username = (username);
    socket.room = (room);
    console.log("user joined:", username);
    socket.emit("joined", {message: "Welcome " + username});

    socket.join(room);

    socket.to(room).emit("message", {
    username: "System",
    text: username + " has joined the chat"
    });
    console.log("joining room:", room)
  });

  
  
})

server.listen(3000, () => {
  console.log("Server running on port 3000")
})

