import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t, language } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      if (!err.response) {
        setError(language === 'uz' ? 'Server bilan ulanish xatosi! Backend yoqilganmi?' : language === 'ru' ? 'Ошибка подключения к серверу! Включен ли бэкенд?' : 'Server connection error! Is the backend running?');
      } else {
        setError(language === 'uz' ? 'Login yoki parol xato!' : language === 'ru' ? 'Неверный логин или пароль!' : 'Invalid username or password!');
      }
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--background)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass" 
        style={{ padding: '40px', width: '100%', maxWidth: '400px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('login_title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('login_subtitle')}</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: 'var(--radius)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('username')}</label>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>{t('password')}</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
            {t('login_btn')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
