import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

// @desc    Access or create a 1-on-1 chat
// @route   POST /api/chat
// @access  Private
export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Conversation.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name avatar email",
  });

  if (isChat.length > 0) {
    let chat = isChat[0].toObject();
    
    // Filter latestMessage based on join time
    if (chat.latestMessage) {
      const membership = chat.memberships?.find(
        (m) => m.user.toString() === req.user._id.toString()
      );
      if (membership && new Date(chat.latestMessage.createdAt) < new Date(membership.joinedAt)) {
        chat.latestMessage = null;
      }
    }
    
    res.send(chat);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Conversation.create({
        ...chatData,
        memberships: chatData.users.map((u) => ({ user: u, joinedAt: new Date() })),
      });
      const FullChat = await Conversation.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Private
export const fetchChats = async (req, res) => {
  try {
    Conversation.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name avatar email",
        });

        // Filter latestMessage for each chat based on join time
        const filteredResults = results.map((chat) => {
          const chatObj = chat.toObject();
          if (chatObj.latestMessage) {
            const membership = chatObj.memberships?.find(
              (m) => m.user.toString() === req.user._id.toString()
            );
            if (membership && new Date(chatObj.latestMessage.createdAt) < new Date(membership.joinedAt)) {
              chatObj.latestMessage = null;
            }
          }
          return chatObj;
        });

        res.status(200).send(filteredResults);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a group chat
// @route   POST /api/chat/group
// @access  Private
export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Conversation.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
      memberships: users.map((u) => ({ user: u._id || u, joinedAt: new Date() })),
    });

    const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // System Message: Group Created
    await Message.create({
      content: `${req.user.name} created the group "${req.body.name}"`,
      chat: groupChat._id,
      type: "system",
    });

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename group
// @route   PUT /api/chat/rename
// @access  Private
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const chat = await Conversation.findById(chatId);
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only admins can rename the group" });
  }

  const updatedChat = await Conversation.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    // System Message: Renamed
    await Message.create({
      content: `${req.user.name} renamed the group to "${chatName}"`,
      chat: chatId,
      type: "system",
    });
    res.json(updatedChat);
  }
};

// @desc    Add to group
// @route   PUT /api/chat/groupadd
// @access  Private
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Conversation.findById(chatId);
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only admins can add users to the group" });
  }

  const added = await Conversation.findByIdAndUpdate(
    chatId,
    { 
      $push: { 
        users: userId,
        memberships: { user: userId, joinedAt: new Date() }
      } 
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    const userAdded = await User.findById(userId);
    // System Message: Joined
    await Message.create({
      content: `${userAdded.name} joined the group`,
      chat: chatId,
      type: "system",
    });
    res.json(added);
  }
};

// @desc    Remove from group (Kick)
// @route   PUT /api/chat/groupremove
// @access  Private
export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Conversation.findById(chatId);
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only admins can remove users from the group" });
  }

  const removed = await Conversation.findByIdAndUpdate(
    chatId,
    { 
      $pull: { 
        users: userId,
        memberships: { user: userId }
      } 
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    const userRemoved = await User.findById(userId);
    // System Message: Removed
    await Message.create({
      content: `${req.user.name} removed ${userRemoved.name} from the group`,
      chat: chatId,
      type: "system",
    });
    res.json(removed);
  }
};

// @desc    Leave group
// @route   PUT /api/chat/leave
// @access  Private
export const leaveGroup = async (req, res) => {
  const { chatId } = req.body;

  const removed = await Conversation.findByIdAndUpdate(
    chatId,
    { 
      $pull: { 
        users: req.user._id,
        memberships: { user: req.user._id }
      } 
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    // System Message: Left
    await Message.create({
      content: `${req.user.name} left the group`,
      chat: chatId,
      type: "system",
    });
    res.json(removed);
  }
};
