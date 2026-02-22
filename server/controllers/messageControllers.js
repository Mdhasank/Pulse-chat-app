import Message from "../models/Message.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Private
export const allMessages = async (req, res) => {
  try {
    const chat = await Conversation.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Find the joinedAt time for the current user
    const membership = chat.memberships?.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    let query = { chat: req.params.chatId };
    if (membership) {
      query.createdAt = { $gte: membership.joinedAt };
    }

    const messages = await Message.find(query)
      .populate("sender", "name avatar email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a new message
// @route   POST /api/message
// @access  Private
export const sendMessage = async (req, res) => {
  const { content, chatId, type, fileUrl } = req.body;

  if (!chatId || (!content && !fileUrl)) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // Security: Check if user is a member of the chat
  const chat = await Conversation.findById(chatId);
  if (!chat || !chat.users.some(u => u.toString() === req.user._id.toString())) {
    return res.status(401).json({ message: "You are not a member of this chat" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    type: type || "text",
    fileUrl: fileUrl,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name avatar email",
    });

    await Conversation.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
