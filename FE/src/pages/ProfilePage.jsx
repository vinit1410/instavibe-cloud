import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Grid, Bookmark, UserPlus, UserMinus, Settings, Camera, X, Lock } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';

const ListModal = ({ title, list, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '0' }}>
          {list.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--ig-secondary-text)' }}>No users found.</p>
          ) : (
            list.map(user => (
              <button
                key={user.userName}
                className="search-result-item"
                style={{ borderBottom: '1px solid var(--ig-border)' }}
                onClick={() => { navigate(`/profile/${user.userName}`); onClose(); }}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { username: paramUsername } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  const targetUsername = paramUsername || currentUser?.username;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get(`/api/user/${targetUsername}`);
      setProfileUser(profileRes.data);

      const postsRes = await axios.get('/api/posts');
      const userPosts = postsRes.data.filter(p => p.username === targetUsername);
      setPosts(userPosts);
    } catch (err) {
      console.error("Profile load failed", err);
      setError('User not found or connection error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const res = await axios.get('/api/posts/saved');
      setSavedPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch saved posts", err);
    }
  };

  useEffect(() => {
    if (targetUsername) {
      fetchProfile();
    }
  }, [targetUsername]);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedPosts();
    }
  }, [activeTab]);

  const handleFollow = async () => {
    if (!profileUser) return;
    try {
      const res = await axios.post(`/api/user/${profileUser.userName}/follow`);
      setProfileUser(prev => ({
        ...prev,
        isFollowing: res.data.isFollowing,
        isRequested: res.data.isRequested,
        followersCount: res.data.isFollowing ? prev.followersCount + 1 : (prev.isFollowing && !res.data.isFollowing ? prev.followersCount - 1 : prev.followersCount)
      }));
    } catch (err) {
      console.error("Follow action failed", err);
    }
  };

  const fetchList = async (type) => {
    try {
      const res = await axios.get(`/api/user/${targetUsername}/${type}`);
      setShowList({ title: type === 'followers' ? 'Followers' : 'Following', list: res.data });
    } catch (err) {
      console.error(`Failed to fetch ${type}`, err);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingPic(true);
    try {
      const res = await axios.post('/api/user/profile-pic', formData);
      setProfileUser(prev => ({ ...prev, profileImageUrl: res.data.url }));
      alert('Profile picture updated!');
    } catch (err) {
      alert('Failed to upload profile picture.');
    } finally {
      setUploadingPic(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading profile...</p></div>;
  if (error) return <div className="error-state"><p>{error}</p></div>;
  if (!profileUser) return <div className="error-state"><p>User not found.</p></div>;

  const isOwnProfile = currentUser?.username === profileUser.userName;

  return (
    <div className="page-container">
      <div className="profile-container container">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{ position: 'relative' }}>
              <img
                src={profileUser.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.userName}`}
                alt={profileUser.userName}
              />
              {isOwnProfile && (
                <label className="pp-upload-label" title="Change Profile Picture">
                  <Camera size={18} />
                  <input type="file" hidden accept="image/*" onChange={handleProfilePicUpload} disabled={uploadingPic} />
                </label>
              )}
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <h2 className="profile-username">{profileUser.userName}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isOwnProfile ? (
                  <>
                    <button className="btn-secondary" style={{ width: 'auto', padding: '6px 16px' }} onClick={() => setShowEditModal(true)}>
                      Edit Profile
                    </button>
                    <button className="icon-btn" onClick={() => navigate('/settings')} title="Settings"><Settings size={20} /></button>
                  </>
                ) : (
                  <button
                    className={profileUser.isFollowing || profileUser.isRequested ? "btn-secondary" : "btn-primary"}
                    style={{ width: 'auto', padding: '6px 24px', minWidth: '100px' }}
                    onClick={handleFollow}
                  >
                    {profileUser.isFollowing ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><UserMinus size={16} /> Unfollow</span>
                    ) : profileUser.isRequested ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Requested</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><UserPlus size={16} /> Follow</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item clickable" onClick={() => fetchList('followers')}>
                <span className="stat-value">{profileUser.followersCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item clickable" onClick={() => fetchList('following')}>
                <span className="stat-value">{profileUser.followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>

            <div className="profile-bio">
              <strong>{profileUser.fullName || profileUser.userName}</strong>
              <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{profileUser.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            <Grid size={16} /> Posts
          </button>
          {isOwnProfile && (
            <button className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
              <Bookmark size={16} /> Saved
            </button>
          )}
        </div>

        {profileUser.isPrivate && !profileUser.isFollowing && !isOwnProfile ? (
          <div className="private-account-message" style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--ig-border)', marginTop: '20px' }}>
            <div className="private-lock-icon" style={{ display: 'inline-flex', padding: '20px', border: '2px solid var(--ig-text)', borderRadius: '50%', marginBottom: '16px' }}><Lock size={40} /></div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>This Account is Private</h3>
            <p style={{ color: 'var(--ig-secondary-text)', fontSize: '14px' }}>Follow to see their photos and videos.</p>
          </div>
        ) : (
          <>
            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <div className="empty-feed" style={{ marginTop: '40px' }}>
                  <div className="empty-feed-icon"><Grid size={36} /></div>
                  <h3>No Posts Yet</h3>
                  {isOwnProfile && (
                    <button className="btn-primary" style={{ width: 'auto', padding: '8px 24px', marginTop: '12px' }}
                      onClick={() => window.dispatchEvent(new CustomEvent('open-post-modal'))}>
                      Share your first photo
                    </button>
                  )}
                </div>
              ) : (
                <div className="profile-grid">
                  {posts.map(post => (
                    <div key={post.id} className="profile-grid-item">
                      <img src={post.imageUrl} alt={post.caption} />
                      <div className="profile-grid-overlay">
                        <span>❤️ {post.likesCount || 0}</span>
                        <span>💬 {post.comments?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'saved' && (
              savedPosts.length === 0 ? (
                <div className="empty-feed" style={{ marginTop: '40px' }}>
                  <div className="empty-feed-icon"><Bookmark size={36} /></div>
                  <h3>No Saved Posts</h3>
                  <p>Save photos to see them here.</p>
                </div>
              ) : (
                <div className="profile-grid">
                  {savedPosts.map(post => (
                    <div key={post.id} className="profile-grid-item">
                      <img src={post.imageUrl} alt={post.caption} />
                      <div className="profile-grid-overlay">
                        <span>❤️ {post.likesCount || 0}</span>
                        <span>💬 {post.comments?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {showList && (
        <ListModal
          title={showList.title}
          list={showList.list}
          onClose={() => setShowList(null)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updated) => setProfileUser(updated)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
