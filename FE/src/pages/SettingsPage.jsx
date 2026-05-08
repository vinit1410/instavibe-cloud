import React from 'react';
import { Settings, User, Lock, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingItem = ({ icon: Icon, label, onClick, color }) => (
  <button className="setting-item" onClick={onClick}>
    <div className="setting-item-left" style={{ color: color || 'inherit' }}>
      <Icon size={20} />
      <span>{label}</span>
    </div>
    <ChevronRight size={18} className="setting-chevron" />
  </button>
);

const SettingsPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="settings-container container">
        <div className="settings-header">
          <Settings size={24} />
          <h2>Settings</h2>
        </div>

        <div className="settings-section">
          <h3>Account</h3>
          <SettingItem icon={User} label="Edit Profile" onClick={() => navigate(`/profile/${user?.username}`)} />
          <SettingItem icon={Lock} label="Privacy and Security" onClick={() => navigate(`/profile/${user?.username}`)} />
          <SettingItem icon={Bell} label="Notifications" onClick={() => navigate('/notifications')} />
        </div>

        <div className="settings-section">
          <h3>Support & About</h3>
          <SettingItem icon={Shield} label="Privacy Policy" onClick={() => navigate('/privacy')} />
          <SettingItem icon={HelpCircle} label="Help Center" onClick={() => navigate('/help')} />
        </div>

        <div className="settings-section">
          <button className="setting-item logout-btn" onClick={logout}>
            <div className="setting-item-left" style={{ color: '#ed4956' }}>
              <LogOut size={20} />
              <span>Log Out</span>
            </div>
          </button>
        </div>

        <div className="settings-footer">
          <p>InstaVibe v1.0.0</p>
          <p>Developed for Azure Deployment</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
