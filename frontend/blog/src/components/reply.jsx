import { useEffect, useState } from 'react';
import axios from 'axios';

// Helper to decode JWT and get user ID
function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
}

function Reply() {
  const [ws, setWs] = useState(null);
  const [input, setInput] = useState("");
  const [allReplies, setAllReplies] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [blog, setBlog] = useState(null);
  const blogId = parseInt(localStorage.getItem("id"));
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken(token);

  useEffect(() => {
    axios.get(`http://localhost:3003/blogs/${blogId}`).then((res) => {
      setBlog(res.data);
    });
  }, [blogId]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3003");

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      socket.send(JSON.stringify({ type: "auth", token }));
      socket.send(JSON.stringify({ type: "get-replies", blogId }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "replies-data") {
        setAllReplies(msg.replies);
      }

      if (["reply-sent", "reply-updated", "reply-deleted"].includes(msg.type)) {
        socket.send(JSON.stringify({ type: "get-replies", blogId }));
      }
    };

    setWs(socket);
    return () => socket.close();
  }, [token, blogId]);

  const sendReply = () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type: editingId ? "edit-reply" : "send-reply",
      replyId: editingId,
      content: input,
      newContent: input,
      blogId,
      parentId: replyTo,
      toUserId: null
    }));

    setInput("");
    setReplyTo(null);
    setEditingId(null);
  };

  const deleteReply = (id) => {
    if (!window.confirm("Delete this reply?")) return;

    ws.send(JSON.stringify({
      type: "delete-reply",
      replyId: id
    }));
  };

  const buildTree = (flat) => {
    const map = {};
    const roots = [];

    flat.forEach(r => (map[r.id] = { ...r, children: [] }));
    flat.forEach(r => {
      if (r.parentId) {
        map[r.parentId]?.children.push(map[r.id]);
      } else {
        roots.push(map[r.id]);
      }
    });

    return roots;
  };

  const renderReplies = (replies, level = 0) => {
    return replies.map(reply => (
      <div
        key={reply.id}
        style={{
          marginLeft: level * 20 + 'px',
          borderLeft: '1px solid #aaa',
          paddingLeft: '10px',
          marginTop: '10px'
        }}
      >
        {editingId === reply.id ? (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Edit your reply"
            />
            <button onClick={sendReply}>Save</button>
            <button onClick={() => { setEditingId(null); setInput(""); }}>Cancel</button>
          </>
        ) : (
          <>
            <strong>{reply.author?.name}</strong>: {reply.content}
            <button onClick={() => setReplyTo(reply.id)} style={{ marginLeft: '10px' }}>
              Reply
            </button>
            {reply.author?.id === userId && (
              <>
                <button
                  onClick={() => {
                    setEditingId(reply.id);
                    setInput(reply.content);
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteReply(reply.id)}
                  style={{ marginLeft: '10px', color: 'red' }}
                >
                  Delete
                </button>
              </>
            )}
          </>
        )}
        {renderReplies(reply.children, level + 1)}
      </div>
    ));
  };

  return (
    <div style={{ padding: '20px' }}>
      {blog && (
        <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '20px' }}>
          <h2>{blog.title}</h2>
          <p>{blog.content}</p>
        </div>
      )}

      <h3>Replies</h3>
      {renderReplies(buildTree(allReplies))}

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder={replyTo ? `Replying to #${replyTo}` : "Write a reply"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendReply} style={{ marginLeft: '10px' }}>
          {editingId ? "Update" : "Send"}
        </button>
        <button onClick={() => window.location.href = "/dashboard"} style={{ marginLeft: '10px' }}>
          Back
        </button>
      </div>
    </div>
  );
}

export default Reply;
