import Mongoose from "mongoose";

const MessageSchema = new Mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const Messages = Mongoose.model("Messages", MessageSchema);
export default Messages;