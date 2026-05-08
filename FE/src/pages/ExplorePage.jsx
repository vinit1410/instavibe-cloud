import React, { useState, useEffect } from 'react';
import { Search, X, User, Star, MapPin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [searchMode, setSearchMode] = useState('all'); // 'all', 'users', 'posts'
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/posts')
      .then(res => setTrendingPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    try {
      // Search users
      const usersRes = await axios.get(`/api/user/search?query=${query}`);
      setUserResults(usersRes.data);

      // Search posts (by title, caption, location, tagged people)
      const postsRes = await axios.get(`/api/posts/search?q=${query}`);
      setPostResults(postsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="explore-container container">
        {/* Search Bar */}
        <div className="explore-search-wrap">
          <div className="search-input-wrap" style={{ maxWidth: 500 }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search photos, users, locations..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="icon-btn" onClick={() => handleSearch('')} style={{ padding: 4 }}>
                <X size={14} />
              </button>
            )}
          </div>
          {searchQuery && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
              <button className={`btn-secondary ${searchMode === 'all' ? 'active-tab' : ''}`} onClick={() => setSearchMode('all')} style={{ fontSize: '12px', padding: '4px 12px' }}>All</button>
              <button className={`btn-secondary ${searchMode === 'users' ? 'active-tab' : ''}`} onClick={() => setSearchMode('users')} style={{ fontSize: '12px', padding: '4px 12px' }}>Users</button>
              <button className={`btn-secondary ${searchMode === 'posts' ? 'active-tab' : ''}`} onClick={() => setSearchMode('posts')} style={{ fontSize: '12px', padding: '4px 12px' }}>Photos</button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div style={{ marginTop: '16px' }}>
            {/* User Results */}
            {(searchMode === 'all' || searchMode === 'users') && userResults.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '8px', color: 'var(--ig-text)' }}>Users</h4>
                <div className="search-results-overlay" style={{ position: 'relative' }}>
                  {userResults.map(user => (
                    <button
                      key={user.userName}
                      className="search-result-item"
                      onClick={() => navigate(`/profile/${user.userName}`)}
                    >
                      <div className="avatar" style={{ width: 44, height: 44 }}>
                        <div className="avatar-inner">
                          <img
                            src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userName}`}
                            alt={user.userName}
                            className="avatar-img"
                          />
                        </div>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div className="username">{user.userName}</div>
                        <div style={{ fontSize: '13px', color: 'var(--ig-secondary-text)' }}>{user.fullName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Post Results */}
            {(searchMode === 'all' || searchMode === 'posts') && postResults.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '8px', color: 'var(--ig-text)' }}>Photos</h4>
                <div className="explore-grid">
                  {postResults.map(post => (
                    <div key={post.id} className="explore-grid-item" onClick={() => navigate('/')}>
                      <img
                        src={post.imageUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop'}
                        alt={post.title || post.caption}
                      />
                      <div className="explore-overlay">
                        <span>❤️ {post.likesCount || 0}</span>
                        <span>⭐ {post.averageRating || 0}</span>
                      </div>
                      {post.location && (
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '10px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <MapPin size={10} /> {post.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {userResults.length === 0 && postResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ig-secondary-text)' }}>
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Trending Grid (when not searching) */}
        {!searchQuery && (
          <>
            <h4 style={{ marginTop: '20px', marginBottom: '12px', color: 'var(--ig-text)' }}>Explore</h4>
            <div className="explore-grid">
              {trendingPosts.length > 0 ? (
                trendingPosts.map(post => (
                  <div key={post.id} className="explore-grid-item" onClick={() => navigate('/')}>
                    <img
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop'}
                      alt={post.title || post.caption}
                    />
                    <div className="explore-overlay">
                      <span>❤️ {post.likesCount || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--ig-secondary-text)' }}>
                  No posts yet. Follow some creators to see content here.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
