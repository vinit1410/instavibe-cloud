import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getIcon = (type) => {
  if (type === 'Like') return <Heart size={18} fill="#ed4956" color="#ed4956" />;
  if (type === 'Comment') return <MessageCircle size={18} color="#0095f6" />;
  if (type === 'Follow') return <UserPlus size={18} color="#2ecc71" />;
  return <Bell size={18} />;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [notifRes, reqRes] = await Promise.all([
        axios.get('/api/notifications').catch(() => ({ data: [] })),
        axios.get('/api/user/follow-requests').catch(() => ({ data: [] }))
      ]);
      setNotifications(notifRes.data);
      setFollowRequests(reqRes.data);
    } catch (err) {
      console.error("Failed to fetch notifications/requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await axios.post('/api/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.postId) {
      // For now we just go to home or user profile, 
      // but ideally we'd show the specific post
      navigate('/'); 
    } else {
      navigate(`/profile/${notif.fromUsername}`);
    }
  };

  const handleRequestAction = async (id, action) => {
    try {
      await axios.post(`/api/user/follow-requests/${id}/${action}`);
      setFollowRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Request action failed", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading notifications...</p></div>;

  return (
    <div className="page-container">
      <div className="notifications-container container">
        <div className="notifications-header">
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllRead}>
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {followRequests.length > 0 && (
          <div className="follow-requests-section" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Follow Requests</h3>
            {followRequests.map(req => (
              <div key={req.id} className="notification-item" style={{ cursor: 'default' }}>
                <div className="notif-avatar" onClick={() => navigate(`/profile/${req.userName}`)} style={{ cursor: 'pointer' }}>
                  <img src={req.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.userName}`} alt={req.userName} />
                </div>
                <div className="notif-content" onClick={() => navigate(`/profile/${req.userName}`)} style={{ cursor: 'pointer' }}>
                  <p><strong>{req.userName}</strong> requested to follow you.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px', width: 'auto' }} onClick={() => handleRequestAction(req.id, 'accept')}>Accept</button>
                  <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px', width: 'auto' }} onClick={() => handleRequestAction(req.id, 'reject')}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length === 0 && followRequests.length === 0 ? (
          <div className="empty-feed" style={{ marginTop: '60px' }}>
            <div className="empty-feed-icon"><Bell size={40} /></div>
            <h3>No Notifications</h3>
            <p>When someone likes your photo or follows you, you'll see it here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notif => (
              <button
                key={notif.id}
                className={`notification-item ${!notif.isRead ? 'unread-notif' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="notif-avatar">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.fromUsername}`}
                    alt={notif.fromUsername}
                  />
                  <div className="notif-type-icon">{getIcon(notif.type)}</div>
                </div>
                <div className="notif-content">
                  <p>
                    <strong>{notif.fromUsername}</strong>{' '}
                    <span>{notif.message}</span>
                  </p>
                  <span className="notif-time">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
                {!notif.isRead && <div className="notif-dot" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
