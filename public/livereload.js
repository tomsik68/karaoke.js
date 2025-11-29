const socket = new WebSocket(`ws://${location.host}`);

socket.addEventListener("message", msg => {
  if (msg.data === "reload") {
    location.reload();
  }
});
