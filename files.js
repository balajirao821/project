const express = require("express");
const SopFile = require("../models/SopFile");
const SopChunk = require("../models/SopChunk");

const router = express.Router();

router.get("/files", async (req, res) => {
  const files = await SopFile.find().sort({ uploadedAt: -1 });
  res.json({ files });
});

const adminAuth = require("../middleware/adminAuth");

router.delete("/files/:filename", adminAuth, async (req, res) => {

  const { filename } = req.params;

  await SopFile.deleteOne({ filename });
  await SopChunk.deleteMany({ "source.file": filename });

  res.json({ success: true });
});

module.exports = router;
