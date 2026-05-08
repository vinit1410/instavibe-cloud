import React, { useState } from 'react';
import { Send, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_CONVERSATIONS = [
  { id: 1, username: 'sarah_creates', lastMessage: 'Hey! Love your latest post 🔥', time: '2m', unread: true, seed: 'sarah' },
  { id: 2, username: 'john_doe99', lastMessage: 'Thanks for the like!', time: '1h', unread: false, seed: 'john' },
  { id: 3, username: 'travel.with.mia', lastMessage: 'When are you visiting? 😊', time: '3h', unread: true, seed: 'mia' },
  { id: 4, username: 'devguru_x', lastMessage: 'Check out my new project!', time: '1d', unread: false, seed: 'dev' },
];

const MessagesPage = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);

  const filtered = conversations.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const selectConversation = (conv) => {
    setSelected(conv);
    // Mark as read
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, unread: false } : c)
    );
    if (!messages[conv.id]) {
      setMessages(prev => ({
        ...prev,
        [conv.id]: [
          { id: 1, from: conv.username, text: conv.lastMessage, time: conv.time }
        ]
      }));
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selected) return;
    const newMsg = {
      id: Date.now(),
      from: user?.username,
      text: inputText.trim(),
      time: 'now'
    };
    setMessages(prev => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), newMsg]
    }));
    setConversations(prev =>
      prev.map(c => c.id === selected.id ? { ...c, lastMessage: inputText.trim(), time: 'now' } : c)
    );
    setInputText('');
  };

  return (
    <div className="page-container">
      <div className="messages-layout">
        {/* Sidebar */}
        <div className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h2 className="messages-title">{user?.username}</h2>
          </div>
          <div className="messages-search">
            <div className="search-input-wrap">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="conversations-list">
            {filtered.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--ig-secondary-text)', fontSize: '14px' }}>
                No conversations found.
              </p>
            ) : (
              filtered.map(conv => (
                <button
                  key={conv.id}
                  className={`conversation-item ${selected?.id === conv.id ? 'active' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conv-avatar">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.seed}`}
                      alt={conv.username}
                    />
                  </div>
                  <div className="conv-info">
                    <div className="conv-top">
                      <span className="conv-name">{conv.username}</span>
                      <span className="conv-time">{conv.time}</span>
                    </div>
                    <span className={`conv-last ${conv.unread ? 'unread' : ''}`}>
                      {conv.lastMessage}
                    </span>
                  </div>
                  {conv.unread && <div className="unread-dot" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="messages-chat">
          {selected ? (
            <>
              <div className="chat-header">
                <div className="conv-avatar" style={{ width: 36, height: 36 }}>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.seed}`}
                    alt={selected.username}
                  />
                </div>
                <span className="chat-username">{selected.username}</span>
              </div>
              <div className="chat-messages">
                {(messages[selected.id] || []).map(msg => (
                  <div
                    key={msg.id}
                    className={`chat-bubble-wrap ${msg.from === user?.username ? 'mine' : 'theirs'}`}
                  >
                    <div className={`chat-bubble ${msg.from === user?.username ? 'bubble-mine' : 'bubble-theirs'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form className="chat-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="chat-input"
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!inputText.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <Send size={48} />
              </div>
              <h3>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
