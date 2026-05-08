import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const TestList = () => {
  const { API_URL, user } = useAuth();
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', department: '', time_limit: 30, file: null });
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

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}tests/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTests(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchDepts();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('department', uploadData.department);
    formData.append('time_limit', uploadData.time_limit);
    formData.append('file', uploadData.file);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}tests/upload/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsUploadOpen(false);
      fetchTests();
    } catch (err) {
      alert("Yuklashda xatolik!");
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Testlar</h1>
          <p style={{ color: 'var(--text-muted)' }}>Mavjud testlar ro'yxati</p>
        </div>
        {(user?.role === 'super_admin' || user?.role === 'dept_head') && (
          <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
            <Upload size={20} />
            Yangi test (Excel)
          </button>
        )}
      </header>

      <div className="dashboard-grid" style={{ padding: 0 }}>
        {tests.map(test => (
          <div key={test.id} className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}><FileText size={24} /></div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{test.id}</span>
            </div>
            <div>
              <h3 style={{ marginBottom: '4px' }}>{test.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{test.department}</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {test.time_limit} daqiqa</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={16} /> {test.question_count} savol</div>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 'auto', width: '100%' }}
              onClick={() => navigate(`/test/${test.id}`)}
              disabled={user?.role === 'monitoring'}
            >
              <Play size={18} />
              Boshlash
            </button>
          </div>
        ))}
      </div>

      {isUploadOpen && (
        <div className="modal-overlay">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card glass" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '24px' }}>Test yuklash (Excel)</h2>
            <form onSubmit={handleUpload}>
              <div className="input-group">
                <label>Test nomi</label>
                <input type="text" onChange={e => setUploadData({...uploadData, title: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Xizmat (Department)</label>
                <select 
                  onChange={e => setUploadData({...uploadData, department: e.target.value})} 
                  required
                >
                  <option value="">Xizmatni tanlang...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Vaqt limiti (daqiqa)</label>
                <input type="number" onChange={e => setUploadData({...uploadData, time_limit: e.target.value})} defaultValue={30} required />
              </div>
              <div className="input-group">
                <label>Excel fayl</label>
                <input type="file" accept=".xlsx" onChange={e => setUploadData({...uploadData, file: e.target.files[0]})} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUploadOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Yuklash</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TestList;
