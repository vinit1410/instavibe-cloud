import React from 'react';
import { HelpCircle, Book, MessageSquare, Shield, Mail } from 'lucide-react';

const HelpPage = () => {
  return (
    <div className="page-container">
      <div className="content-container container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
        <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <HelpCircle size={48} color="var(--ig-primary)" style={{ marginBottom: '16px' }} />
          <h1>Help Center</h1>
          <p style={{ color: 'var(--ig-secondary-text)' }}>Everything you need to know about InstaVibe.</p>
        </div>

        <div className="help-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="help-card card" style={{ padding: '24px' }}>
            <Book size={24} style={{ marginBottom: '12px' }} />
            <h3>Getting Started</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--ig-primary)' }}>How to create an account?</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--ig-primary)' }}>Uploading your first post</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--ig-primary)' }}>Setting up your profile</a></li>
            </ul>
          </div>

          <div className="help-card card" style={{ padding: '24px' }}>
            <Shield size={24} style={{ marginBottom: '12px' }} />
            <h3>Privacy & Safety</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--ig-primary)' }}>Making your account private</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--ig-primary)' }}>Blocking unwanted users</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--ig-primary)' }}>Managing notifications</a></li>
            </ul>
          </div>
        </div>

        <div className="support-section card" style={{ marginTop: '40px', padding: '32px', textAlign: 'center' }}>
          <MessageSquare size={32} style={{ marginBottom: '16px' }} />
          <h2>Still need help?</h2>
          <p style={{ marginBottom: '24px' }}>Our support team is available 24/7 to assist you with any issues.</p>
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => window.location.href = 'mailto:support@instavibe.com'}>
            <Mail size={18} style={{ marginRight: '8px' }} /> Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
