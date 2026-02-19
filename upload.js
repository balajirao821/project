const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const parsePDF = require("../services/pdfParser");
const chunkText = require("../services/chunker");
const generateEmbedding = require("../services/embedder");
const SopChunk = require("../models/SopChunk");
const SopFile = require("../models/SopFile");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const cleanName = file.originalname
      .replace(/\s+/g, " ")
      .trim();
    cb(null, cleanName);
  }
});


const upload = multer({ storage });

router.post(
  "/upload-sop",
  adminAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("📄 Upload received:", req.file?.originalname);

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileName = req.file.originalname;
      await SopFile.findOneAndUpdate(
        { filename: req.file.originalname },
        { filename: req.file.originalname },
        { upsert: true }
      );
      await SopChunk.deleteMany({ "metadata.source": fileName });
      const pages = await parsePDF(req.file.path);

      let stored = 0;

      for (let i = 0; i < pages.length; i++) {
        const pageText = pages[i].text;
        const pageNumber = pages[i].page;

        const chunks = chunkText(pageText, pageNumber);

        for (const chunk of chunks) {
          if (!chunk.text || !chunk.text.trim()) continue;

          const embedding = await generateEmbedding(chunk.text);

          await SopChunk.create({
            text: chunk.text,
            embedding,
            metadata: {
              source: fileName,
              page: pageNumber,
              chunk: chunk.metadata?.chunk
            }
          });

          stored++;
        }
      }
      console.log("✂️ Total chunks stored:", stored);
      res.json({
        message: "Uploaded Successfully",
        chunksStored: stored,
        pages: pages.length
      });

    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ error: "Uploading failed" });
    }
  });

module.exports = router;
