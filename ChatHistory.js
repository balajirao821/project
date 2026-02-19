const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sources: [
    {
      source: { type: String, required: true },
      page: { type: String, required: true }
    }
  ],  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);
