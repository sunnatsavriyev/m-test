import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Edit2, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Only for editing now
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '', first_name: '', last_name: '', password: '', role: 'employee', department: ''
  });

  const fetchDepts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}users/departments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}users/manage/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepts();
  }, []);

  const openEditModal = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
      role: user.role,
      department: user.department || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (editingId) {
        const data = { ...formData };
        if (!data.password) delete data.password;
        
        await axios.put(`${API_URL}users/manage/${editingId}/`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsModalOpen(false);
        setEditingId(null);
        fetchUsers();
        setFormData({ username: '', first_name: '', last_name: '', password: '', role: 'employee', department: '' });
      }
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Haqiqatdan o'chirmoqchimisiz?")) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${API_URL}users/manage/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (err) {
        alert("O'chirishda xatolik!");
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Xodimlar boshqaruvi</h1>
          <p style={{ color: 'var(--text-muted)' }}>Tizim foydalanuvchilarini boshqarish</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/users/add')}>
          <UserPlus size={20} />
          Qo'shish
        </button>
      </header>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px' }}>Ism Familiya</th>
              <th style={{ padding: '16px' }}>Login</th>
              <th style={{ padding: '16px' }}>Rol</th>
              <th style={{ padding: '16px' }}>Xizmat</th>
              <th style={{ padding: '16px' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                <td style={{ padding: '16px' }}>{user.first_name} {user.last_name}</td>
                <td style={{ padding: '16px' }}>{user.username}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: 'var(--surface-hover)' }}>{user.role}</span>
                </td>
                <td style={{ padding: '16px' }}>{user.department_name || '-'}</td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditModal(user)}><Edit2 size={16} /></button>
                  <button className="btn btn-secondary" style={{ padding: '6px', color: 'var(--error)' }} onClick={() => deleteUser(user.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Foydalanuvchilar topilmadi</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card glass" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingId ? "Tahrirlash" : "Yangi foydalanuvchi"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Ism</label>
                  <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Familiya</label>
                  <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                </div>
              </div>
              <div className="input-group">
                <label>Login</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Parol {editingId && "(O'zgartirish shart emas)"}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId} />
              </div>
              <div className="input-group">
                <label>Rol</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="employee">Xodim</option>
                  <option value="dept_head">Xizmat boshlig'i</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {!['super_admin', 'monitoring'].includes(formData.role) && (
                <div className="input-group">
                  <label>Xizmat (Department)</label>
                  <select 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Xizmatni tanlang...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ username: '', first_name: '', last_name: '', password: '', role: 'employee', department: '' }); }}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">{editingId ? "Yangilash" : "Saqlash"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
