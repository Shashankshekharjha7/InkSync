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

app.get("/canvas", (req,res) => {
  res.sendFile(path.join(__dirname, "canvas.html"));
})

const rooms = {};
const words = [
  "samosa",
  "biryani",
  "chai",
  "ms dhoni",
  "auto rickshaw",
  "gully boy",
  "cricket bat",
  "bollywood dance",
  "metro train",
  "taj mahal"
];

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

    //Add user to the room in our object
    if(!rooms[room]) {
      rooms[room] = {
        players: [],
        turnIndex: 0
      };
    }
    rooms[room].players.push(username);

    console.log(rooms);

    

    socket.to(room).emit("message", {
    username: "System",
    text: username + " has joined the chat"
    });
    console.log("joining room:", room)
  });

  
  socket.on("nextTurn", (room) => {
    const game = rooms[room];
    
    const currentPlayer = game.players[game.turnIndex];
    
    //pick random words
    const word = words[Math.floor(Math.random() * words.length)];

    //tell eeryone who is drawing
    io.to(room).emit("roundStart", {
      drawer: currentPlayer,
    });

    //send secret word only to drawer(socket that triggered this for now)
    socket.emit("yourWord", word);

    //move turn forward
    game.turnIndex = (game.turnIndex + 1) % game.players.length;
    
  });
  

  socket.on("drawing", ({ x1, y1, x2, y2 }) => {
    if(!socket.room) return;

  

    socket.broadcast.to(socket.room).emit("drawing", {
      x1,
      y1,
      x2,
      y2
      });
  });

  
  
})

server.listen(3000, () => {
  console.log("Server running on port 3000")
})

