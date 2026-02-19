module.exports = function chunkText(text, pageNumber, chunkSize = 500) {
  if (!text || typeof text !== "string") return [];

  const words = text.split(/\s+/);
  const chunks = [];

  let current = [];
  let chunkIndex = 0;

    for (let i = 0; i < words.length; i++) {
        current.push(words[i]);

    if (current.length >= chunkSize) {
      chunks.push({
        text: current.join(" "),
        metadata: {
          page: pageNumber,    
          chunk: chunkIndex++  
        }
      });
      current = [];
    }
  }

  if (current.length) {
    chunks.push({
      text: current.join(" "),
      metadata: {
        page: pageNumber,
        chunk: chunkIndex
      }
    });
  }

  return chunks;
};
