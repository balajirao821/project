import { useState, useEffect } from "react";

function App() {
  const API = "http://localhost:5050";

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [files, setFiles] = useState([]);

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const loadFiles = async () => {
    const res = await fetch(`${API}/api/files`);
    const data = await res.json();
    setFiles(data.files || []);
  };

  const loadChatHistory = async () => {
    const res = await fetch(`${API}/api/chat/history`);
    const data = await res.json();
    setChatHistory(data.history || []);
  };

  useEffect(() => {
    loadFiles();
    loadChatHistory();
  }, []);

  const uploadSOP = async () => {
    if (!file) return setUploadStatus("❌ Select a PDF");
    if (!adminKey) return setUploadStatus("❌ Admin key required");

    const formData = new FormData();
    formData.append("file", file);

    setUploadStatus("Uploading...");

    const res = await fetch(`${API}/api/upload-sop`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: formData
    });

    const data = await res.json();
    setUploadStatus(`✅ Uploaded (${data.chunksStored} chunks)`);
    loadFiles();
  };

  const deleteFile = async (filename) => {
    if (!adminKey) return alert("Admin key required");

    await fetch(`${API}/api/files/${filename}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey }
    });

    loadFiles();
  };

  const askQuestion = async () => {
    if (!query.trim()) return;

    setAnswer("");
    setSources([]);
    setLoading(true);

    const res = await fetch(`${API}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop();

      for (const event of events) {
        if (!event.startsWith("data:")) continue;

        const payload = event.slice(5).trimStart();

        if (payload.startsWith("__SOURCES__")) {
          const srcJson = payload.replace("__SOURCES__", "").trim();
          try {
            setSources(JSON.parse(srcJson));
          } catch (e) {
            console.error("Invalid sources payload", e);
          }
          continue;
        }
        if (payload.includes("__SOURCES__")) continue;
        setAnswer(prev => prev + payload+" ");
      }
    }

    setLoading(false);
    loadChatHistory();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 OpsMind AI</h1>
        <span>Context-Aware Corporate Knowledge Brain</span>
      </header>

      <main className="main">
        <aside className="sidebar">
          <h3>📄 Upload SOP</h3>

          <input
            type="password"
            placeholder="Admin Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />

          <ul className="file-list">
            {files.length === 0 && <li>No files uploaded</li>}
            {files.map(f => (
              <div key={f.filename}>
                <a
                  href={`${API}/uploads/${encodeURIComponent(f.filename)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {f.filename}
                </a>
                <button onClick={() => deleteFile(f.filename)}>
                  🗑️ Delete PDF
                </button>
              </div>
            ))}
          </ul>

          <hr />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={uploadSOP}>Upload PDF</button>
          {uploadStatus && <p className="status">{uploadStatus}</p>}
        </aside>

        {/* CHAT */}
        <section className="chat">
          <div className="chat-history">
            <h4>🕘 Previous Chats</h4>

            {chatHistory.map((chat, idx) => (
              <div key={idx} className="chat-history-item">
                <strong>Q:</strong> {chat.question}
                <br />
                <strong>A:</strong> {chat.answer}
                <hr />
              </div>
            ))}
          </div>

          <div className="chat-window">
            {loading && <p>🤖 Thinking…</p>}

            {!answer && !loading && (
              <p className="placeholder">Ask a question about your SOPs…</p>
            )}

            {answer && (
              <pre style={{ whiteSpace: "pre-wrap" }}>
                <strong>Answer:</strong>
                <ul></ul>
                {answer}
              </pre>
            )}

            {sources.length > 0 && answer.trim().toLowerCase() !== "i don't know." &&(
              <div className="sources-box">
                <strong>Sources:</strong>
                <ul>
                  {sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={`${API}/uploads/${encodeURIComponent(s.source)}#page=${s.page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.source} — Page {s.page}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask OpsMind AI…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={askQuestion}>Ask</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
