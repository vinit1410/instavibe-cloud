import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await login(username.trim(), password);
            navigate('/');
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Invalid username or password.';
            setError(typeof msg === 'string' ? msg : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-logo">InstaVibe</h1>
                <p className="auth-subtitle">Sign in to see photos from your friends.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        id="login-username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        disabled={loading}
                    />
                    <input
                        id="login-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        disabled={loading}
                    />
                    <button
                        id="login-submit-btn"
                        type="submit"
                        className="btn-primary"
                        disabled={loading || !username.trim() || !password.trim()}
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                {error && <p className="auth-error">{error}</p>}

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <Link to="/register" id="go-to-register-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
