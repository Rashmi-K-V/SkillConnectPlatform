import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  text: String
}, { timestamps: true });


const Message =  mongoose.model("Message", messageSchema);

export default Message;