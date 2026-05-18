import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Loading from '../components/Loading';

const DepartmentManagement = () => {
  const { API_URL } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}users/departments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}users/departments/`, { name: newName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewName('');
      fetchDepartments();
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu xizmatni o'chirmoqchimisiz?")) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${API_URL}users/departments/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDepartments();
      } catch (err) {
        alert("O'chirishda xatolik!");
      }
    }
  };

  if (loading) return <Loading fullPage={false} />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Xizmatlar boshqaruvi</h1>
        <p style={{ color: 'var(--text-muted)' }}>Tizimdagi xizmatlar (departmentlar) ro'yxati</p>
      </header>

      <div className="card glass" style={{ marginBottom: '32px' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input 
              type="text" 
              placeholder="Yangi xizmat nomi..." 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={20} /> Qo'shish
          </button>
        </form>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {departments.map(dept => (
          <motion.div 
            key={dept.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card glass" 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--primary)' }}>
                <Building2 size={20} />
              </div>
              <span style={{ fontWeight: 600 }}>{dept.name}</span>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px', color: 'var(--error)' }}
              onClick={() => handleDelete(dept.id)}
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;
