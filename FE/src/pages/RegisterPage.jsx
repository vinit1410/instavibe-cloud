import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, User, Mail, Lock, Info } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        bio: ''
    });
    const [profilePic, setProfilePic] = useState(null);
    const [picPreview, setPicPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPicPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }
        
        const data = new FormData();
        data.append('username', formData.username.trim());
        data.append('email', formData.email.trim());
        data.append('password', formData.password);
        data.append('fullName', formData.fullName.trim());
        data.append('bio', formData.bio.trim());
        if (profilePic) {
            data.append('profilePic', profilePic);
        }

        setLoading(true);
        setError('');
        try {
            await register(data);
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const errors = err?.response?.data;
            if (Array.isArray(errors) && errors.length > 0) {
                setError(errors[0].description || 'Registration failed.');
            } else {
                setError('Registration failed. Username or email might already be taken.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <h1 className="auth-logo">InstaVibe</h1>
                <p className="auth-subtitle">Sign up to see photos and videos from your friends.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="register-avatar-upload" onClick={() => fileInputRef.current.click()}>
                        {picPreview ? (
                            <img src={picPreview} alt="Preview" className="avatar-preview-img" />
                        ) : (
                            <div className="avatar-placeholder">
                                <Camera size={32} />
                                <span>Add Photo</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*"
                        />
                    </div>

                    <div className="input-group">
                        <Mail className="input-icon" size={18} />
                        <input
                            type="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={handleChange('email')}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <User className="input-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange('fullName')}
                        />
                    </div>

                    <div className="input-group">
                        <User className="input-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Username *"
                            value={formData.username}
                            onChange={handleChange('username')}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Info className="input-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Bio (optional)"
                            value={formData.bio}
                            onChange={handleChange('bio')}
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={18} />
                        <input
                            type="password"
                            placeholder="Password * (min 6 chars)"
                            value={formData.password}
                            onChange={handleChange('password')}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading || !formData.username.trim() || !formData.email.trim() || !formData.password.trim()}
                        style={{ marginTop: '16px' }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <p className="auth-switch" style={{ marginTop: '24px' }}>
                    Already have an account?{' '}
                    <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
