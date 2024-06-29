const { MongoClient } = require("mongodb");

// Replace with your MongoDB connection string
const uri =
  "mongodb+srv://dungbui1110:dragonnica2001@cluster0.hm6gngk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Example: 'mongodb://username:password@host:port/databaseName'

let db;

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(uri);
    console.log("Connected to MongoDB");

    // Specify your database name
    db = client.db(); // Replace with your database name
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Call connectToDatabase to establish connection
connectToDatabase();

const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "https://viecipe.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // Example: Joining a room based on user ID
  socket.on("joinRoom", (userId) => {
    socket.join(userId); // Join room identified by userId
    console.log(`User ${userId} joined the room`);
  });

  // Example: Handling private messages
  socket.on("privateMessage", async ({ senderId, recipientId, input }) => {
    try {
      const messagesCollection = db.collection("messages");
      const result = await messagesCollection.insertOne({
        senderId,
        recipientId,
        input,
        timestamp: new Date(),
        status: "unread",
      });

      // console.log("Message stored in MongoDB:", result.insertedId);

      // Emit message to a specific room (user)
      io.to(recipientId).emit("privateMessage", {
        input: input,
        recipientId: recipientId,
        senderId: senderId,
        timestamp: new Date(),
      });
      io.to(senderId).emit("message", {
        input: input,
        recipientId: recipientId,
        senderId: senderId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error storing message in MongoDB:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
