import React from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Home, MessageCircle, PlusSquare, Compass, Bell, User, LogOut, Sun, Moon, Palette } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MessagesPage from './pages/MessagesPage'
import ExplorePage from './pages/ExplorePage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import PrivacyPage from './pages/PrivacyPage'
import CreatePostModal from './components/CreatePostModal'

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifCount = async () => {
    try {
      const res = await axios.get('/api/notifications');
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) { console.error(err); }
  };

  React.useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-post-modal', handleOpenModal);
    
    if (user) {
      fetchNotifCount();
      const interval = setInterval(fetchNotifCount, 30000); // Polling every 30s
      return () => {
        window.removeEventListener('open-post-modal', handleOpenModal);
        clearInterval(interval);
      };
    }
    return () => window.removeEventListener('open-post-modal', handleOpenModal);
  }, [user]);

  const isActive = (path) => location.pathname === path;

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun size={15} />;
    if (theme === 'dark') return <Moon size={15} />;
    return <Palette size={15} />;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ig-bg)' }}>
      <nav className="glass-nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div
            className="nav-logo"
            onClick={() => navigate('/')}
            title="Home"
          >
            InstaVibe
          </div>

          {/* Nav Icons */}
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button className={`icon-btn nav-icon-btn ${isActive('/') ? 'nav-active' : ''}`}
              onClick={() => navigate('/')} title="Home">
              <Home size={24} />
            </button>

            <button className={`icon-btn nav-icon-btn ${isActive('/messages') ? 'nav-active' : ''}`}
              onClick={() => navigate('/messages')} title="Messages">
              <MessageCircle size={24} />
            </button>

            {(user?.role === 'Creator' || user?.role === 'Admin') && (
              <button className="icon-btn nav-icon-btn create-btn"
                onClick={() => setIsModalOpen(true)} title="Create Post">
                <PlusSquare size={24} />
              </button>
            )}

            <button className={`icon-btn nav-icon-btn ${isActive('/explore') ? 'nav-active' : ''}`}
              onClick={() => navigate('/explore')} title="Explore">
              <Compass size={24} />
            </button>

            <button className={`icon-btn nav-icon-btn notif-btn ${isActive('/notifications') ? 'nav-active' : ''}`}
              onClick={() => navigate('/notifications')} title="Notifications">
              <Bell size={24} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Switch Theme"
              style={{ margin: '0 6px' }}
            >
              {getThemeIcon()}
              <span>{theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Sunset'}</span>
            </button>

            <button className={`icon-btn nav-icon-btn ${isActive('/profile') ? 'nav-active' : ''}`}
              onClick={() => navigate('/profile')} title={`Profile: @${user?.username}`}>
              <div className="avatar" style={{ width: 24, height: 24, padding: 0, background: 'none' }}>
                <div className="avatar-inner" style={{ padding: 0 }}>
                  <img
                    src={user?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                    alt="Me"
                    className="avatar-img"
                  />
                </div>
              </div>
            </button>
            <span style={{ fontSize: '12px', fontWeight: '600', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: user?.role === 'Creator' ? '#8b5cf6' : user?.role === 'Admin' ? '#ef4444' : '#3b82f6', color: 'white', marginLeft: '4px' }}>
              {user?.role}
            </span>

            <button className="icon-btn nav-icon-btn"
              onClick={() => setIsLogoutModalOpen(true)} title="Logout"
              style={{ color: '#ed4956', marginLeft: '4px' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {children}

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={() => { setIsModalOpen(false); window.location.reload(); }}
      />

      {isLogoutModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsLogoutModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '320px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Out?</h3>
              <button className="icon-btn" onClick={() => setIsLogoutModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--ig-secondary-text)', fontSize: '14px' }}>
                Are you sure you want to log out of <strong>InstaVibe</strong>?
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn-primary" style={{ background: '#ed4956', flex: 1 }} onClick={logout}>
                  Log Out
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsLogoutModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
