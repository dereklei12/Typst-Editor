import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Signup({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('密码不匹配');
    }

    if (password.length < 6) {
      return setError('密码至少需要6个字符');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
    } catch (err) {
      setError('注册失败: ' + err.message);
    }
    setLoading(false);
  }

  async function handleGoogleSignup() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError('Google注册失败: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>注册 Typst 编辑器</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="至少6个字符"
            />
          </div>
          <div className="form-group">
            <label>确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="再次输入密码"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="auth-divider">或</div>

        <button onClick={handleGoogleSignup} disabled={loading} className="btn-google">
          使用 Google 注册
        </button>

        <div className="auth-switch">
          已有账户？{' '}
          <button onClick={onSwitchToLogin} className="link-button">
            登录
          </button>
        </div>
      </div>
    </div>
  );
}
