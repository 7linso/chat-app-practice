import mongoose from "mongoose";

const ReactionToMessageSchema = new mongoose.Schema({
  reaction: {
    type: String,
    required: true,
  },
  whoReacted: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const messageSChema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replyToMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "No more than 5 images allowed",
      },
    },
    reaction: {
      type: [ReactionToMessageSchema],
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSChema);

export default Message;
