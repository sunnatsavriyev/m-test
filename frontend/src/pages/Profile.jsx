import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const Profile = () => {
  const { user, setUser, API_URL } = useAuth();
  const { t, language } = useSettings();
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [passData, setPassData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(`${API_URL}users/profile/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      setUser(prev => ({ ...prev, avatar: response.data.avatar }));
      setStatus({ type: 'success', message: t('avatar_success') });
    } catch (err) {
      setStatus({ type: 'error', message: language === 'uz' ? 'Rasm yuklashda xatolik!' : language === 'ru' ? 'Ошибка загрузки изображения!' : 'Error uploading image!' });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(`${API_URL}users/profile/`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, ...response.data }));
      setStatus({ type: 'success', message: t('profile_success') });
    } catch (err) {
      setStatus({ type: 'error', message: t('error') });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      setStatus({ type: 'error', message: language === 'uz' ? 'Yangi parollar mos kelmadi!' : language === 'ru' ? 'Новые пароли не совпадают!' : 'New passwords do not match!' });
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}users/change-password/`, {
        old_password: passData.old_password,
        new_password: passData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', message: t('password_success') });
      setPassData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setStatus({ type: 'error', message: language === 'uz' ? "Eski parol noto'g'ri!" : language === 'ru' ? "Неверный старый пароль!" : "Incorrect old password!" });
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{t('profile_title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('profile_subtitle')}</p>
      </header>

      {status.message && (
        <div style={{ 
          background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          color: status.type === 'success' ? 'var(--success)' : 'var(--error)', 
          padding: '16px', borderRadius: 'var(--radius)', marginBottom: '24px', textAlign: 'center' 
        }}>
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card glass">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={64} color="var(--text-muted)" />}
              </div>
              <label 
                htmlFor="avatar-upload" 
                style={{ 
                  position: 'absolute', 
                  bottom: '0', 
                  right: '0', 
                  background: 'var(--primary)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  padding: '10px', 
                  color: 'white', 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)'
                }}
                className="btn-hover"
              >
                <Camera size={18} />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </label>
            </div>
            <h3 style={{ textTransform: 'capitalize' }}>{user?.first_name} {user?.last_name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.department_name || t('no_dept')}</p>
            <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>
              {user?.role ? user.role.replace('_', ' ') : ''}
            </span>
          </div>
 
          <form onSubmit={handleProfileUpdate}>
            <div className="input-group">
              <label>{t('first_name')}</label>
              <input type="text" value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>{t('last_name')}</label>
              <input type="text" value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Save size={18} /> {t('save')}
            </button>
          </form>
        </div>

        <div className="card glass">
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={20} /> {t('change_password')}</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="input-group">
              <label>{t('old_password')}</label>
              <input type="password" value={passData.old_password} onChange={e => setPassData({...passData, old_password: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>{t('new_password')}</label>
              <input type="password" value={passData.new_password} onChange={e => setPassData({...passData, new_password: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>{t('confirm_password')}</label>
              <input type="password" value={passData.confirm_password} onChange={e => setPassData({...passData, confirm_password: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
              {t('change_password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
