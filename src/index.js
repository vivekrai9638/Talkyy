const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  getUsersInRoom,
  getUser,
  removeUser,
} = require("./utils/users");

// PORT
const port = process.env.PORT;

// path to static folder
const publicDirectoryPath = path.join(__dirname, "../public");

// initializing express
const app = express();

app.use(express.static(publicDirectoryPath));

// setting server for sockets and express
const server = http.createServer(app);
const io = socketio(server);

///////////// io events///////////////

io.on("connection", (socket) => {
  // join event
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit(
      "messageAdmin",
      generateMessage(
        "Admin",
        `Yo! <b style="color:#bbb;text-transform:capitalize;">${user.username}</b>, welcome!`
      )
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "messageAdmin",
        generateMessage(
          "Admin",
          `<b style='color:#bbb;text-transform:capitalize;'>${user.username}</b> joined the chat room`
        )
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });
  // welcome event

  // notification event

  // message send event
  socket.on("sendMessage", (message) => {
    const user = getUser(socket.id);

    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(user.username, message));
  });

  // user disconnect event
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "messageAdmin",
        generateMessage(
          "Admin",
          `<b style='color:#bbb;text-transform:capitalize;'>${user.username}</b> left the chat room`
        )
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});
// starting server
server.listen(port, () => {
  console.log("server is up and running at ", port);
});
