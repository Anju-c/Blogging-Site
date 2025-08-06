// server.js
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const http = require("http");
const { PrismaClient } = require("@prisma/client");
const { WebSocketServer } = require("ws");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Map();

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return res.status(400).send("Incorrect inputs");
  try {
    await prisma.User.create({
      data: { name: username, email, password }
    });
    res.json({ message: "Created" });
  } catch {
    res.status(500).send("Error");
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Incorrect inputs");
  try {
    const user = await prisma.User.findFirst({ where: { name: username, password } });
    const token = jwt.sign({ id: user.id }, "123");
    res.json({ message: "Signed in", user, t: token });
  } catch {
    res.status(500).send("Error");
  }
});

app.post("/create-blogs", async (req, res) => {
  try {
    const { token } = req.headers;
    const { title, content } = req.body;
    const decoded = jwt.verify(token, "123");
    await prisma.Blog.create({
      data: { title, content, userId: decoded.id }
    });
    res.json("Added");
  } catch {
    res.status(500).send("Error creating blog");
  }
});

app.get("/blogs", async (req, res) => {
  const blogs = await prisma.Blog.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(blogs);
});

app.get("/blogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const blog = await prisma.Blog.findUnique({ where: { id } });
  res.json(blog);
});

app.get("/users", async (req, res) => {
  const users = await prisma.User.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users);
});

app.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.User.findUnique({ where: { id } });
  res.json(user);
});

app.post("/follow/:name", async (req, res) => {
  const name = req.params.name;
  const decoded = jwt.verify(req.headers.token, "123");
  const user = await prisma.User.findFirst({ where: { name } });
  await prisma.Follow.create({
    data: {
      followid: user.id,
      followerid: decoded.id
    }
  });
  res.json("Following");
});

app.get("/followers", async (req, res) => {
  const decoded = jwt.verify(req.headers.token, "123");
  const follows = await prisma.Follow.findMany({ where: { followerid: decoded.id } });
  const ids = follows.map(f => f.followid);
  const users = await prisma.User.findMany({ where: { id: { in: ids } } });
  res.json(users);
});

app.get("/following/post", async (req, res) => {
  const decoded = jwt.verify(req.headers.token, "123");
  const follows = await prisma.Follow.findMany({ where: { followerid: decoded.id } });
  const ids = follows.map(f => f.followid);
  const posts = await prisma.Blog.findMany({ where: { userId: { in: ids } } });
  res.json(posts);
});

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "auth") {
        const decoded = jwt.verify(msg.token, "123");
        ws.userId = decoded.id;
        clients.set(ws.userId, ws);
        console.log("Authenticated user:", ws.userId);
        return;
      }

      if (msg.type === "send-reply") {
        const { content, blogId, parentId, toUserId } = msg;
        const reply = await prisma.reply.create({
          data: {
            content,
            blogId,
            parentId: parentId || null,
            userId: ws.userId
          }
        });

        ws.send(JSON.stringify({ type: "reply-sent", reply }));

        const receiver = clients.get(toUserId);
        if (receiver) {
          receiver.send(JSON.stringify({
            type: "new-reply",
            from: ws.userId,
            reply
          }));
        }
        return;
      }

      if (msg.type === "get-replies") {
        const replies = await prisma.reply.findMany({
          where: { blogId: parseInt(msg.blogId) },
          include: { author: true },
          orderBy: { createdAt: 'asc' }
        });
        ws.send(JSON.stringify({
          type: "replies-data",
          blogId: msg.blogId,
          replies
        }));
        return;
      }

      if (msg.type === "edit-reply") {
        const reply = await prisma.reply.findUnique({
          where: { id: parseInt(msg.replyId) }
        });
        if (!reply || reply.userId !== ws.userId) {
          return ws.send(JSON.stringify({
            type: "error",
            message: "Unauthorized to edit this reply"
          }));
        }

        const updatedReply = await prisma.reply.update({
          where: { id: reply.id },
          data: {
            content: msg.newContent,
            updatedAt: new Date()
          }
        });
        ws.send(JSON.stringify({ type: "reply-updated", reply: updatedReply }));
        return;
      }

      if (msg.type === "delete-reply") {
        const reply = await prisma.reply.findUnique({
          where: { id: parseInt(msg.replyId) }
        });
        if (!reply || reply.userId !== ws.userId) {
          return ws.send(JSON.stringify({
            type: "error",
            message: "Unauthorized to delete this reply"
          }));
        }

        await prisma.reply.delete({ where: { id: reply.id } });
        ws.send(JSON.stringify({ type: "reply-deleted", replyId: msg.replyId }));
        return;
      }

    } catch (err) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid WebSocket message" }));
    }
  });

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log("WebSocket closed for user", ws.userId);
    }
  });
});

server.listen(3003, () => {
  console.log("Server + WebSocket running at http://localhost:3003");
});
