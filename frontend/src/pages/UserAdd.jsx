import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';

const UserAdd = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    username: '', first_name: '', last_name: '', password: '', role: 'employee', department: ''
  });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}users/departments/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(response.data);
      } catch (err) { console.error(err); }
    };
    fetchDepts();
  }, [API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      // Clear department if not needed
      const data = { ...formData };
      if (['super_admin', 'monitoring'].includes(data.role)) {
        data.department = null;
      }
      
      await axios.post(`${API_URL}users/manage/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/users');
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => navigate('/users')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Yangi foydalanuvchi</h1>
          <p style={{ color: 'var(--text-muted)' }}>Tizimga yangi xodim qo'shish</p>
        </div>
      </header>

      <div className="card glass">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group">
              <label>Ism</label>
              <input 
                type="text" 
                value={formData.first_name} 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Familiya</label>
              <input 
                type="text" 
                value={formData.last_name} 
                onChange={e => setFormData({...formData, last_name: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Login (Username)</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Parol</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Rol</label>
            <select 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
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

          <div style={{ marginTop: '32px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Save size={20} />
              Foydalanuvchini saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAdd;
