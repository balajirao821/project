let extractor = null;

async function loadModel() {
  if (!extractor) {
    const { pipeline } = await import("@xenova/transformers");

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("✅ Embedding model loaded");
  }
}

module.exports = async function generateEmbedding(text) {
  if (!text || !text.trim()) {
    throw new Error("Cannot generate embedding for empty text");
  }

  if (!extractor) {
    await loadModel();
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  });

  const vector = Array.from(output.data);

  console.log("📐 Embedding length:", vector.length);

  return vector;
};
