const express = require("express");
const router = express.Router();

const SopChunk = require("../models/SopChunk");
const ChatHistory = require("../models/ChatHistory");
const generateEmbedding = require("../services/embedder");
const callLLM = require("../services/llm");

router.post("/chat/stream", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.end();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const queryEmbedding = await generateEmbedding(query);

    const chunks = await SopChunk.aggregate([
      {
        $vectorSearch: {
          index: "sopchunks_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 3
        }
      },
      {
        $project: {
          text: 1,
          metadata: 1
        }
      }
    ]);

    if (!chunks.length) {
      res.write(`data: I don't know.\n\n`);
      res.end();
      return;
    }

    const context = chunks.map(c => c.text).join("\n\n");
    const answer = await callLLM({ query, context });

    const normalizedAnswer = answer.trim().toLowerCase();

    const isIDontKnow =
      normalizedAnswer === "i don't know." ||
      normalizedAnswer === "i don't know" ||
      normalizedAnswer.includes("i don't know");

    let sources = [];

    if (!isIDontKnow) {
      sources = chunks.map(c => ({
        source: c.metadata.source,
        page: c.metadata.page
      }));
    }

    await ChatHistory.create({
      question: query,
      answer,
      sources: sources.length ? sources : [],
      createdAt: new Date()
    });

    for (const token of answer.split(/(\s+)/)) {
      res.write(`data: ${token}\n\n`);
      await new Promise(r => setTimeout(r, 5));
    }
    if (sources.length > 0) {
      res.write(`data: __SOURCES__${JSON.stringify(sources)}\n\n`);
    }
    res.end();

  } catch (err) {
    console.error("❌ CHAT ERROR:", err);
    res.write(`data: I don't know.\n\n`);
    res.end();
  }
});


module.exports = router;
