import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="page-container">
      <div className="content-container container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
        <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Shield size={48} color="#2ecc71" style={{ marginBottom: '16px' }} />
          <h1>Privacy Policy</h1>
          <p style={{ color: 'var(--ig-secondary-text)' }}>Last updated: May 2026</p>
        </div>

        <div className="privacy-content card" style={{ padding: '40px', lineHeight: '1.6' }}>
          <section style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Eye size={24} />
              <h2>Data Collection</h2>
            </div>
            <p>At InstaVibe, we collect information you provide directly to us when you create an account, such as your name, email, and profile data. We also store the content you upload, including photos and comments.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Lock size={24} />
              <h2>How We Use Data</h2>
            </div>
            <p>Your data is used to provide and improve the platform experience. We use your interactions (likes, follows) to suggest content and connect you with other users. We never sell your personal data to third parties.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FileText size={24} />
              <h2>Your Controls</h2>
            </div>
            <p>You have full control over your privacy. You can set your account to private at any time, which restricts your content visibility to followers only. You can also delete your account and all associated data at any time.</p>
          </section>

          <div style={{ borderTop: '1px solid var(--ig-border)', paddingTop: '24px', textAlign: 'center', color: 'var(--ig-secondary-text)', fontSize: '14px' }}>
            <p>If you have any questions about this policy, please contact our Data Protection Officer at privacy@instavibe.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
