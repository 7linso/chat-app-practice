import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (e) {
    console.log(`Error get users for side bar: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (e) {
    console.log(`Error get messages: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id;
    let imageURL;

    if (image) {
      const result = await cloudinary.uploader.upload(image);
      if (!result)
        return res.staus(500).json({ message: "Internal Server Error." });

      imageURL = result.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageURL,
    });
    await newMessage.save();

    //todo: socket.io
    res.status(200).json(newMessage);
  } catch (e) {
    console.log(`Error send message: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
