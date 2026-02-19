const mongoose = require("mongoose");

const SopChunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },

  metadata: {
    source:String,
    page: Number,
    chunk: Number
  },

  source: {
    file: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SopChunk", SopChunkSchema);
