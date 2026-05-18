import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LineChart, FileText, UserCircle, LogOut, Building2, Settings } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useSettings();

  const menuItems = [
    { title: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/', roles: ['super_admin', 'monitoring', 'dept_head', 'employee'] },
    { title: t('employees'), icon: <Users size={20} />, path: '/users', roles: ['super_admin'] },
    { title: t('departments'), icon: <Building2 size={20} />, path: '/departments', roles: ['super_admin'] },
    { title: t('monitoring'), icon: <LineChart size={20} />, path: '/monitoring', roles: ['super_admin', 'monitoring', 'dept_head'] },
    { title: t('tests'), icon: <FileText size={20} />, path: '/tests', roles: ['employee', 'dept_head', 'super_admin'] },
    { title: t('profile'), icon: <UserCircle size={20} />, path: '/profile', roles: ['super_admin', 'monitoring', 'dept_head', 'employee'] },
    { title: t('settings'), icon: <Settings size={20} />, path: '/settings', roles: ['super_admin', 'monitoring', 'dept_head', 'employee'] },
  ];

  return (
    <div className="sidebar">
      <div className="logo" style={{ marginBottom: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="Metro Logo" style={{ width: '80px', height: 'auto', filter: 'drop-shadow(0 0 10px var(--primary-glow))' }} />
        <h2 style={{ background: 'linear-gradient(135deg, var(--text), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.2rem', letterSpacing: '2px' }}>METRO TEST</h2>
      </div>

      <div className="menu">
        {menuItems.filter(item => user && item.roles.includes(user.role)).map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => isActive ? "btn btn-primary" : "btn btn-secondary"}
            style={{ width: '100%', marginBottom: '12px', justifyContent: 'flex-start', border: 'none' }}
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>

      <div className="logout" style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
        {user && (
          <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={24} color="white" />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.first_name} {user.last_name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user.role ? user.role.replace('_', ' ') : ''}
              </div>
            </div>
          </div>
        )}
        <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--error)' }} onClick={logout}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
