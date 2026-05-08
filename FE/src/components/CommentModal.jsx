import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CommentModal = ({ post, onClose, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/posts/${post.id}/comment`, { content: commentText.trim() });
      const newComment = res.data;
      setComments([...comments, newComment]);
      setCommentText('');
      if (onCommentAdded) onCommentAdded(newComment);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="comment-modal-content" onClick={e => e.stopPropagation()}>
        <div className="comment-modal-left">
          <img src={post.imageUrl} alt="Post" className="comment-modal-img" />
        </div>
        <div className="comment-modal-right">
          <div className="comment-modal-header">
            <div className="avatar" style={{ width: 32, height: 32 }}>
               <div className="avatar-inner">
                  <img src={post.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} alt="" />
               </div>
            </div>
            <span className="username">{post.username}</span>
            <button className="icon-btn close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="comment-list-area">
             <div className="comment-item caption-item">
                <span className="username">{post.username}</span>
                <span className="comment-text">{post.caption}</span>
             </div>
             {comments.map(c => (
               <div key={c.id} className="comment-item">
                 <div className="avatar" style={{ width: 28, height: 28 }}>
                    <div className="avatar-inner">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`} alt="" />
                    </div>
                 </div>
                 <div className="comment-content">
                    <span className="username">{c.username}</span>
                    <span className="comment-text">{c.content}</span>
                    <div className="comment-meta">{new Date(c.createdAt).toLocaleDateString()}</div>
                 </div>
               </div>
             ))}
          </div>

          <div className="comment-modal-footer">
             <div className="footer-actions">
                <Heart size={24} />
                <MessageCircle size={24} />
                <Send size={24} />
                <Bookmark size={24} style={{ marginLeft: 'auto' }} />
             </div>
             <div className="likes-label">{post.likesCount} likes</div>
             <form className="comment-input-wrap" onSubmit={handleSubmit}>
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button type="submit" disabled={!commentText.trim() || submitting}>
                   {submitting ? '...' : 'Post'}
                </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
