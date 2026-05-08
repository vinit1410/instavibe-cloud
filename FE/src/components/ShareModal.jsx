import React from 'react';
import { X, Send, Mail, MessageSquare, Copy, Link as LinkIcon } from 'lucide-react';

const ShareModal = ({ post, following, onClose }) => {
  const shareUrl = `${window.location.origin}/post/${post.id}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Check out this post on InstaVibe!`);

  const shareOptions = [
    { name: 'WhatsApp', icon: <MessageSquare size={24} color="#25D366" />, url: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Email', icon: <Mail size={24} color="#EA4335" />, url: `mailto:?subject=InstaVibe%20Post&body=${encodedText}%0A${shareUrl}` },
    { name: 'Copy Link', icon: <LinkIcon size={24} color="#0095f6" />, action: () => {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied!');
    } }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share to...</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ padding: '0' }}>
          {/* Share Options Grid */}
          <div className="share-options-grid">
            {shareOptions.map(opt => (
              <button 
                key={opt.name} 
                className="share-opt-btn"
                onClick={() => { opt.action ? opt.action() : window.open(opt.url, '_blank'); }}
              >
                <div className="share-opt-icon">{opt.icon}</div>
                <span>{opt.name}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--ig-border)' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Suggestions</h4>
            <div className="share-user-list">
              {following.length > 0 ? following.map(user => (
                <div key={user.userName} className="share-user-item">
                  <img src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userName}`} alt="" />
                  <div className="share-user-info">
                    <span className="username">{user.userName}</span>
                    <span className="fullname">{user.fullName}</span>
                  </div>
                  <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => alert(`Shared to ${user.userName}!`)}>
                    Send
                  </button>
                </div>
              )) : (
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ig-secondary-text)' }}>No followers to suggest.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
