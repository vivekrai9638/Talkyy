const users = [];

const addUser = ({ username, room, id }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (users.find((user) => user.username == username && user.room === room))
    return { error: "Username taken" };

  const user = {
    username,
    room,
    id,
  };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser,
};
