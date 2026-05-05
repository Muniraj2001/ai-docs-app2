import { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles.css";

const API = "https://ai-docs-app1-1.onrender.com/docs";

function App() {
  const [userId, setUserId] = useState(1);
  const [docs, setDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const loadDocs = async () => {
    const res = await axios.get(`${API}/documents?user_id=${userId}`);
    setDocs(res.data.my_docs);
    setSharedDocs(res.data.shared_docs);
  };

  useEffect(() => {
    loadDocs();
  }, [userId]);

  const createDoc = async () => {
    await axios.post(`${API}/documents`, {
      title: "New Document",
      content: "",
      owner_id: userId,
    });
    loadDocs();
  };

  const openDoc = async (id) => {
    const res = await axios.get(`${API}/documents/${id}`);
    setCurrentDoc(id);
    setTitle(res.data[1]);
    setContent(res.data[2]);
  };

  const saveDoc = async () => {
    await axios.put(`${API}/documents/${currentDoc}`, {
      title,
      content,
      owner_id: userId,
    });
    alert("Document saved!");
    loadDocs();
  };

  const shareDoc = async () => {
    const user = prompt("Enter user ID to share (1 or 2):");
    if (!user) return;
    await axios.post(`${API}/documents/${currentDoc}/share?user_id=${user}`);
    alert("Document shared!");
  };

  const uploadFile = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await axios.post(`${API}/upload`, formData);
    setContent(res.data.content);
  };

  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>AI Docs</h2>

        <div className="user-switch">
          <button onClick={() => setUserId(1)}>User 1</button>
          <button onClick={() => setUserId(2)}>User 2</button>
        </div>

        <button className="create-btn" onClick={createDoc}>
          + Create Document
        </button>

        <h3>My Docs</h3>
        {docs.map((d) => (
          <button
            key={d[0]}
            className="doc-btn"
            onClick={() => openDoc(d[0])}
          >
            {d[1]}
          </button>
        ))}

        <h3>Shared Docs</h3>
        {sharedDocs.map((d) => (
          <button
            key={d[0]}
            className="doc-btn"
            onClick={() => openDoc(d[0])}
          >
            {d[1]}
          </button>
        ))}
      </div>

      {/* Main Editor */}
      <div className="main">
        {currentDoc ? (
          <>
            <input
              className="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
            />

            <ReactQuill value={content} onChange={setContent} />

            <div className="actions">
              <button onClick={saveDoc}>Save</button>
              <button onClick={shareDoc}>Share</button>
              <input type="file" onChange={uploadFile} />
            </div>
          </>
        ) : (
          <p>Select or create a document</p>
        )}
      </div>
    </div>
  );
}

export default App;
