import Messages from "../Models/Message.js";


// Get all unique users the owner has messaged with
export const getInboxUsers = async (req, res, next) => {
  try {
    const { ownerId } = req.body;

    const messages = await Messages.find({ users: ownerId });

    const userIds = new Set();
    messages.forEach(msg => {
      msg.users.forEach(user => {
        if (user !== ownerId) userIds.add(user);
      });
    });

    res.status(200).json(Array.from(userIds));
  } catch (err) {
    next(err);
  }
};

// Get messages between two users
export const getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ msg: "Missing from or to user IDs" });
    }

    const messages = await Messages.find({
      users: { $all: [from, to] },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => ({
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
      sender: msg.sender.toString(),
      createdAt: msg.createdAt,
    }));

    res.status(200).json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

// Get all messages - for inbox listing or other purpose
export const getAllMessage = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ msg: "Missing from or to user IDs" });
    }

    const messages = await Messages.find({
      users: { $all: [from, to] },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => ({
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
      sender: msg.sender.toString(),
      createdAt: msg.createdAt,
    }));

    res.status(200).json(projectedMessages);
  } catch (err) {
    next(err);
  }
};

// Add a new message between two users
export const addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    if (!from || !to || !message) {
      return res.status(400).json({ msg: "Missing required fields" });
    }
    console.log("Adding message:", { from, to, message });
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) {
      return res.status(201).json({ msg: "Message added successfully." });
    } else {
      return res.status(500).json({ msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    next(ex);
  }
};
