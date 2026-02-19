const express = require("express");
const ChatHistory = require("../models/ChatHistory");

const router = express.Router();

router.get("/history", async (req, res) => {
  const history = await ChatHistory.find().sort({ createdAt: -1 });
  res.json(history);
});

module.exports = router;
