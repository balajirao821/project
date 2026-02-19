const express = require("express");
const router = express.Router();
const ChatHistory = require("../models/ChatHistory");

router.get("/chat/history", async (req, res) => {
  try {
    const history = await ChatHistory
      .find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ history });
  } catch (err) {
    console.error("❌ Chat history error:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

module.exports = router;
