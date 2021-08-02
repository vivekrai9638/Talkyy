const socket = io();

let lastUser;

// Elements
const $messagesPanel = document.querySelector("#messages-form");
const $messages = document.querySelector(".messages");
const $roomMembers = document.querySelector(".members");

// Templates
const messageTemplate = document.querySelector(
  "#message-template-receive"
).innerHTML;
const messageTemplateSelf = document.querySelector(
  "#message-template-send"
).innerHTML;
const messageTemplate__continue = document.querySelector(
  "#message-template-receive-continue"
).innerHTML;
const messageTemplateSelf__continue = document.querySelector(
  "#message-template-send-continue"
).innerHTML;
const membersTemplate = document.querySelector("#members-template").innerHTML;
const adminMessageTemplate = document.querySelector(
  "#admin-message-template"
).innerHTML;

/////////////// AUTO SCROLL /////////////

const autoScroll = () => {
  // new message height
  const $newMessage = $messages.lastElementChild;

  // margin
  const margin = parseInt(getComputedStyle($newMessage).marginBottom);

  const newMessageHeight = $newMessage.offsetHeight + margin;

  // container height
  const containerHeight =
    $messages.scrollHeight -
    parseInt(getComputedStyle($messages).marginBottom) -
    parseInt(getComputedStyle($messages).paddingBottom) -
    parseInt(getComputedStyle($messages).paddingTop);

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // scrolled Upto
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset)
    $messages.scrollTop = $messages.scrollHeight + 1;
};

/////////////////// Sockeit.io Events//////////

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (!username || !room) {
  location.href = "/";
  alert("Enter valid credentials at home page");
}

// room join event
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

// message received event
socket.on("message", (message) => {
  // console.log(message);
  if (lastUser !== message.username) {
    const html = Mustache.render(messageTemplate, {
      username: message.username,
      text: message.text,
      createdAt: moment(message.createdAt).format("h:mm a"),
    });

    $messages.insertAdjacentHTML("beforeend", html);
  } else {
    const html = Mustache.render(messageTemplate__continue, {
      username: message.username,
      text: message.text,
      createdAt: moment(message.createdAt).format("h:mm a"),
    });

    $messages.insertAdjacentHTML("beforeend", html);
  }
  if ($messages.lastElementChild.children[0].children[0])
    lastUser = $messages.lastElementChild.children[0].children[0].innerText;

  autoScroll();
});

// send message event
$messagesPanel.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  if (!message.length) return;
  if (message.length > 2000) return window.alert("Text size too large !");

  if (message && lastUser !== username) {
    const html = Mustache.render(messageTemplateSelf, {
      username,
      text: message,
      createdAt: moment(Date.now()).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    socket.emit("sendMessage", message);
    autoScroll();
  } else {
    const html = Mustache.render(messageTemplateSelf__continue, {
      username,
      text: message,
      createdAt: moment(Date.now()).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    socket.emit("sendMessage", message);
    autoScroll();
  }

  if ($messages.lastElementChild.children[0].children[0])
    lastUser = $messages.lastElementChild.children[0].children[0].innerText;

  e.target.elements.message.value = "";
  e.target.elements.message.focus();
});

// members event
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(membersTemplate, {
    room,
    users,
  });

  $roomMembers.innerHTML = html;
});

// Admin messages
socket.on("messageAdmin", (message) => {
  const html = Mustache.render(adminMessageTemplate, {
    username: message.username,
    text: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

document.querySelector("textarea").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    e.target.form.dispatchEvent(new Event("submit", { cancelable: true }));
  }
});

// send button
const button = document.querySelector("#send__btn");

// media query mobile
const media = window.matchMedia("(min-width:600px)");
try {
  if (media.matches) button.innerText = "Send Message";
} catch (e) {
  console.log(e);
}
media.addEventListener("change", (e) => {
  if (e.matches) {
    button.innerText = "Send Message";
  } else button.innerText = "Send";
});
