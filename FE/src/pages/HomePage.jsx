import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, PlusSquare, X, Star, MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ShareModal from '../components/ShareModal'
import CommentModal from '../components/CommentModal'

const Post = ({ post, onLike, onDelete, onComment }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [isSaved, setIsSaved] = useState(post.isSavedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [following, setFollowing] = useState([]);
  const [userRating, setUserRating] = useState(post.currentUserRating || 0);
  const [avgRating, setAvgRating] = useState(post.averageRating || 0);
  const [ratingsCount, setRatingsCount] = useState(post.ratingsCount || 0);


  useEffect(() => {
    setIsLiked(post.isLikedByCurrentUser);
    setIsSaved(post.isSavedByCurrentUser);
    setLikesCount(post.likesCount);
    setComments(post.comments || []);
  }, [post]);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    await onLike(post.id);
  };

  const handleSave = async () => {
    try {
      const res = await axios.post(`/api/posts/${post.id}/save`);
      setIsSaved(res.data.isSaved);
    } catch (err) { console.error(err); }
  };

  const openShare = async () => {
    try {
      const res = await axios.get(`/api/user/${user.username}/following`);
      setFollowing(res.data);
      setShowShareModal(true);
    } catch (err) { console.error(err); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const result = await onComment(post.id, commentText.trim());
      if (result) {
        setComments(prev => [...prev, result]);
      }
      setCommentText('');
    } catch (err) {
      console.error('Comment failed', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${post.username}`)}>
          <div className="avatar-inner">
            <img
              src={post.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`}
              alt={post.username}
              className="avatar-img"
            />
          </div>
        </div>
        <div className="username" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${post.username}`)}>{post.username}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {(user?.role === 'Admin' || user?.username === post.username) && (
            <button className="delete-btn" onClick={() => onDelete(post.id)}>Delete</button>
          )}
          <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}><MoreHorizontal size={20} /></button>
          {showMenu && (
            <div className="post-menu">
              <button onClick={() => { alert('Reported!'); setShowMenu(false); }}>Report</button>
              <button onClick={() => setShowMenu(false)}>Close</button>
            </div>
          )}
        </div>
      </div>

      <div className="post-image-container" onDoubleClick={handleLike}>
        <img src={post.imageUrl} alt="Post" className="post-image" />
      </div>

      <div className="post-actions">
        <div className="action-with-count">
          <button className="icon-btn" onClick={handleLike}>
            <Heart size={24} fill={isLiked ? "#ed4956" : "none"} color={isLiked ? "#ed4956" : "currentColor"} />
          </button>
          <span className="action-count">{likesCount}</span>
        </div>
        <div className="action-with-count">
          <button className="icon-btn" onClick={() => setShowCommentModal(true)}>
            <MessageCircle size={24} />
          </button>
          <span className="action-count">{comments.length}</span>
        </div>
        <div className="action-with-count">
          <button className="icon-btn" onClick={openShare}>
            <Send size={24} />
          </button>
          <span className="action-count">Share</span>
        </div>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={handleSave}>
          <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="post-info">
        <div className="likes-count">{likesCount} likes</div>
        {post.title && <div className="post-title" style={{ fontWeight: '600', marginBottom: '4px' }}>{post.title}</div>}
        <div className="caption">
          <span className="username" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${post.username}`)}>{post.username}</span>
          {post.caption}
        </div>
        {post.location && (
          <div style={{ fontSize: '12px', color: 'var(--ig-secondary-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> {post.location}
          </div>
        )}
        {post.taggedPeople && post.taggedPeople.length > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--ig-secondary-text)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> {post.taggedPeople.join(', ')}
          </div>
        )}

        {/* Rating section */}
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1,2,3,4,5].map(star => (
              <Star
                key={star}
                size={18}
                fill={star <= userRating ? '#fbbf24' : 'none'}
                color={star <= userRating ? '#fbbf24' : '#9ca3af'}
                style={{ cursor: 'pointer' }}
                onClick={async () => {
                  try {
                    const res = await axios.post(`/api/posts/${post.id}/rate`, { score: star });
                    setUserRating(star);
                    setAvgRating(res.data.averageRating);
                    setRatingsCount(res.data.ratingsCount);
                  } catch (err) { console.error(err); }
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--ig-secondary-text)' }}>
            {avgRating > 0 ? `${avgRating}/5 (${ratingsCount})` : 'No ratings'}
          </span>
        </div>

        {/* Always show comments preview */}
        <div className="comments-section">
          {comments.slice(0, 2).map(c => (
            <div key={c.id} className="comment">
              <span className="username">{c.username}</span>
              {c.content}
            </div>
          ))}
          {comments.length > 2 && (
            <button className="view-comments-btn" onClick={() => setShowCommentModal(true)}>
              View all {comments.length} comments
            </button>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          post={post}
          following={following}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showCommentModal && (
        <CommentModal
          post={post}
          onClose={() => setShowCommentModal(false)}
          onCommentAdded={(newC) => setComments([...comments, newC])}
        />
      )}
    </div>
  );
};

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get('/api/user/suggestions');
        setSuggestions(res.data);
      } catch (err) { console.error(err); }
    };
    if (user) fetchSuggestions();
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try { await axios.post(`/api/posts/${id}/like`); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`/api/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert('Failed to delete post.'); }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comment`, { content });
      return response.data;
    } catch (err) { throw err; }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page-container feed-layout container">
      <main className="posts-container">
        {posts.length > 0 ? (
          posts.map(post => (
            <Post key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} onComment={handleComment} />
          ))
        ) : (
          <div className="empty-feed">
            <h2>Your feed is empty</h2>
            {(user?.role === 'Creator' || user?.role === 'Admin') ? (
              <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-post-modal'))}>
                Create your first post
              </button>
            ) : (
              <p>Follow some creators to see their content here.</p>
            )}
          </div>
        )}
      </main>

      <div className="suggestions-sidebar">
        <div className="sidebar-user">
           <div className="avatar" style={{ width: 44, height: 44 }}>
              <div className="avatar-inner">
                 <img src={user?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Me" />
              </div>
           </div>
           <div className="sidebar-user-info">
              <span className="username">{user?.username}</span>
              <span className="fullname">{user?.fullName || 'User'}</span>
           </div>
           <button className="text-btn">Switch</button>
        </div>

        <div className="suggestions-header">
           <span>Suggestions for you</span>
           <button className="text-btn dark-btn">See All</button>
        </div>

        <div className="suggestions-list">
           {suggestions.map(s => (
             <div key={s.userName} className="suggestion-item">
                <div className="avatar" style={{ width: 32, height: 32 }}>
                   <div className="avatar-inner">
                      <img src={s.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.userName}`} alt={s.userName} />
                   </div>
                </div>
                <div className="suggestion-info">
                   <span className="username" onClick={() => navigate(`/profile/${s.userName}`)}>{s.userName}</span>
                   <span className="followed-by">Suggested for you</span>
                </div>
                <button className="text-btn" onClick={() => axios.post(`/api/user/follow/${s.userName}`).then(() => setSuggestions(prev => prev.filter(u => u.userName !== s.userName)))}>Follow</button>
             </div>
           ))}
        </div>

        <div className="sidebar-footer">
           <p>© 2026 INSTAVIBE FROM AZURE</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
