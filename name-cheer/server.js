// server.js
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

// Next.jsの設定
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// HTTPサーバーの作成
app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res); // Next.jsのリクエスト処理
  });

  // Socket.IOの設定
  const io = new Server(server);

  io.on('connection', (socket) => {

    socket.on('sign-in', (name) => {
      console.log('Name received:', name, socket.id);

      socket.on('message', (msg) => {
        console.log('Message received:', msg);
        io.emit('message', msg); // 全クライアントにメッセージを送信
      });
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id); // socket.id 分からない
    });
  });

  // サーバーの起動
  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
