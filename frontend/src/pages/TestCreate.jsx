import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const TestCreate = () => {
  const { API_URL, user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [uploadData, setUploadData] = useState({ title: '', department: '', time_limit: 30 });
  const [pools, setPools] = useState([{ id: Date.now(), name: '', pick_count: 10, file: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const fetchDepts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}users/departments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user && user.role !== 'super_admin' && user.role !== 'dept_head') {
      navigate('/tests');
    }
    fetchDepts();
  }, [user]);

  const addPool = () => {
    setPools([...pools, { id: Date.now(), name: '', pick_count: 10, file: null }]);
  };

  const removePool = (id) => {
    if (pools.length > 1) {
      setPools(pools.filter(p => p.id !== id));
    }
  };

  const updatePool = (id, field, value) => {
    setPools(pools.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('department', uploadData.department);
    formData.append('time_limit', uploadData.time_limit);

    pools.forEach((pool, index) => {
      if (pool.file) {
        formData.append(`pools[${index}][file]`, pool.file);
        formData.append(`pools[${index}][name]`, pool.name || `Pool ${index + 1}`);
        formData.append(`pools[${index}][pick_count]`, pool.pick_count);
      }
    });

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}tests/upload/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/tests');
    } catch (err) {
      alert(err.response?.data?.error || "Yuklashda xatolik!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => navigate('/tests')}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Yangi test yaratish</h1>
          <p style={{ color: 'var(--text-muted)' }}>Multi-Excel hovuzlari orqali test tuzish</p>
        </div>
      </header>

      <div className="card glass" style={{ padding: '40px' }}>
        <form onSubmit={handleUpload}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Test nomi</label>
              <input 
                type="text" 
                placeholder="Masalan: AKT va Texnika xavfsizligi" 
                onChange={e => setUploadData({...uploadData, title: e.target.value})} 
                required 
                style={{ fontSize: '1.1rem', padding: '14px' }}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Xizmat (Department)</label>
              <select 
                onChange={e => setUploadData({...uploadData, department: e.target.value})} 
                required
                style={{ fontSize: '1.1rem', padding: '14px' }}
              >
                <option value="">Xizmatni tanlang...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group" style={{ maxWidth: '300px' }}>
            <label>Vaqt limiti (umumiy daqiqa)</label>
            <input 
              type="number" 
              onChange={e => setUploadData({...uploadData, time_limit: e.target.value})} 
              defaultValue={30} 
              required 
              style={{ fontSize: '1.1rem', padding: '14px' }}
            />
          </div>

          <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Savol guruhlari (Excel hovuzlari)</h2>
              <button type="button" className="btn btn-primary" onClick={addPool} style={{ fontSize: '0.9rem' }}>
                <Plus size={18} /> Guruh qo'shish
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pools.map((pool, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  key={pool.id} 
                  className="glass" 
                  style={{ 
                    padding: '24px', 
                    borderRadius: '16px', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr auto', gap: '20px', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Guruh nomi</label>
                      <input 
                        type="text" 
                        value={pool.name} 
                        onChange={e => updatePool(pool.id, 'name', e.target.value)} 
                        placeholder="Masalan: AKT" 
                        required
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Excel fayl yuklash</label>
                      <input 
                        type="file" 
                        accept=".xlsx" 
                        onChange={e => updatePool(pool.id, 'file', e.target.files[0])} 
                        required 
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Random tanlash soni</label>
                      <input 
                        type="number" 
                        value={pool.pick_count} 
                        onChange={e => updatePool(pool.id, 'pick_count', e.target.value)} 
                        min="1" 
                        required 
                      />
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ color: '#ef4444', padding: '12px', background: 'rgba(239, 68, 68, 0.1)' }} 
                      onClick={() => removePool(pool.id)} 
                      disabled={pools.length === 1}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '60px' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '14px 28px' }} onClick={() => navigate('/tests')}>Bekor qilish</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Saqlanmoqda...' : 'Testni to\'liq saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCreate;
