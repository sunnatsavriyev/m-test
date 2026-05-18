import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Globe, Palette, CheckCircle } from 'lucide-react';

const Settings = () => {
  const { language, theme, changeLanguage, toggleTheme, t } = useSettings();

  const languages = [
    { code: 'uz', name: "O'zbekcha", flag: "🇺🇿" },
    { code: 'ru', name: "Русский", flag: "🇷🇺" },
    { code: 'en', name: "English", flag: "🇺🇸" }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{t('settings_title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('settings_subtitle')}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Language Selection Card */}
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe color="var(--primary)" /> {t('select_lang')}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'space-between',
                  padding: '16px',
                  width: '100%',
                  border: language === lang.code ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: language === lang.code ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface)'
                }}
                onClick={() => changeLanguage(lang.code)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                  <span style={{ fontWeight: 600 }}>{lang.name}</span>
                </div>
                {language === lang.code && <CheckCircle size={20} color="var(--primary)" />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection Card */}
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette color="var(--primary)" /> {t('select_theme')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Light Theme Option */}
            <div 
              style={{
                border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: theme === 'light' ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface)',
                padding: '20px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={() => theme !== 'light' && toggleTheme()}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{t('light_mode')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Oq fonli chiroyli dizayn</div>
              </div>
              {theme === 'light' && <CheckCircle size={20} color="var(--primary)" />}
            </div>

            {/* Dark Theme Option */}
            <div 
              style={{
                border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: theme === 'dark' ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface)',
                padding: '20px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={() => theme !== 'dark' && toggleTheme()}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{t('dark_mode')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qora fonli tungi rejim</div>
              </div>
              {theme === 'dark' && <CheckCircle size={20} color="var(--primary)" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
