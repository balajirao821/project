module.exports = async function callLLM({ query, context }) {
  const key = process.env.GROQ_API_KEY;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "Answer ONLY using the provided context. If not present, say: I don't know."
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion:\n${query}`
          }
        ]
      })
    }
  );

  const json = await response.json();
  return json.choices?.[0]?.message?.content || "I don't know.";
};
