import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LineChart, FileText, UserCircle, LogOut, Building2 } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['super_admin', 'monitoring', 'dept_head', 'employee'] },
    { title: 'Xodimlar', icon: <Users size={20} />, path: '/users', roles: ['super_admin'] },
    { title: 'Xizmatlar', icon: <Building2 size={20} />, path: '/departments', roles: ['super_admin'] },
    { title: 'Monitoring', icon: <LineChart size={20} />, path: '/monitoring', roles: ['super_admin', 'monitoring', 'dept_head'] },
    { title: 'Testlar', icon: <FileText size={20} />, path: '/tests', roles: ['employee', 'dept_head', 'super_admin'] },
    { title: 'Profil', icon: <UserCircle size={20} />, path: '/profile', roles: ['super_admin', 'monitoring', 'dept_head', 'employee'] },
  ];

  return (
    <div className="sidebar">
      <div className="logo" style={{ marginBottom: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="Metro Logo" style={{ width: '80px', height: 'auto', filter: 'drop-shadow(0 0 10px var(--primary-glow))' }} />
        <h2 style={{ background: 'linear-gradient(135deg, var(--text), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.2rem', letterSpacing: '2px' }}>METRO TEST</h2>
      </div>

      <div className="menu">
        {menuItems.filter(item => item.roles.includes(user?.role)).map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => `btn btn-secondary ${isActive ? 'btn-primary' : ''}`}
            style={{ width: '100%', marginBottom: '12px', justifyContent: 'flex-start', border: 'none' }}
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>

      <div className="logout" style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
        <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--error)' }} onClick={logout}>
          <LogOut size={20} />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
