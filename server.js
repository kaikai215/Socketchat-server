const http = require("http");
const { WebSocketServer, WebSocket } = require("ws");

const port = 8080;
// WebSocket 要掛在一個 HTTP 伺服器上。
const httpServer = http.createServer();
const wss = new WebSocketServer({ server: httpServer });
// 目前所有連線。兩台模擬器連上來，這裡就會有兩筆。
const clients = new Set();

wss.on("connection", (socket) => {
  clients.add(socket);
  console.log(`有人連線，目前 ${clients.size} 人`);

  socket.on("message", (data) => {
    const text = data.toString();
    console.log(`收到：${text}`);

    // 轉給「其他」連線。略過發送者，App 端已經把自己的氣泡畫上了。
    for (const client of clients) {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    }
  });

  socket.on("close", () => {
    clients.delete(socket);
    console.log(`有人離開，目前 ${clients.size} 人`);
  });
});

// 只聽本機。模擬器用 ws://127.0.0.1:8080 連這個位址。
httpServer.listen(port, "127.0.0.1", () => {
  console.log(`WebSocket 伺服器已啟動：ws://127.0.0.1:${port}`);
});
