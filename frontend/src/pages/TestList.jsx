import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, FileText, Upload, Plus, Trash2, X, Award, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const TestList = () => {
  const { API_URL, user } = useAuth();
  const { t } = useSettings();
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  
  const navigate = useNavigate();

  const handleDelete = async (testId) => {
    if (window.confirm(t('confirm_delete'))) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${API_URL}tests/${testId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTests();
      } catch (err) {
        console.error(err);
        alert(t('error'));
      }
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}tests/${editingTest.id}/`, editingTest, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingTest(null);
      fetchTests();
    } catch (err) {
      console.error(err);
      alert(t('error'));
    }
  };

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

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{t('test_title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('test_subtitle')}</p>
        </div>
        {(user?.role === 'super_admin' || user?.role === 'dept_head') && (
          <button className="btn btn-primary" onClick={() => navigate('/test/create')}>
            <Upload size={20} />
            {t('new_test')}
          </button>
        )}
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {tests.map(test => (
          <div key={test.id} className="card glass test-list-card" style={{ 
            gap: '32px', 
            alignItems: 'center',
            padding: '24px'
          }}>
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              padding: '20px', 
              borderRadius: '16px', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={32} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{test.title}</h3>
                <span style={{ fontSize: '0.75rem', background: 'var(--surface-hover)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>#{test.id}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{test.department}</p>
              
              <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18} color="var(--primary)" /> {test.time_limit} {t('minutes_count')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={18} color="var(--primary)" /> {test.question_count} {t('questions_count')}</div>
              </div>
            </div>
 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => navigate(`/test/${test.id}/history`)}
              >
                <Award size={18} />
                {t('results')}
              </button>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => navigate(`/test/${test.id}`)}
                disabled={user?.role === 'monitoring'}
              >
                <Play size={18} fill="currentColor" />
                {t('start_test')}
              </button>
            </div>
            
            {(user?.role === 'super_admin' || user?.role === 'dept_head') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '10px', color: 'var(--primary)' }}
                  onClick={() => handleEdit(test)}
                  title="Tahrirlash"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '10px', color: 'var(--error)' }}
                  onClick={() => handleDelete(test.id)}
                  title="O'chirish"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingTest && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="card glass" 
              style={{ width: '400px', maxWidth: '90%', background: 'var(--surface)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('edit_test')}</h2>
                <button onClick={() => setEditingTest(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
              </div>
 
              <form onSubmit={saveEdit}>
                <div className="input-group">
                  <label>{t('test_name')}</label>
                  <input type="text" value={editingTest.title} onChange={e => setEditingTest({...editingTest, title: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>{t('service')}</label>
                  <select value={editingTest.department} onChange={e => setEditingTest({...editingTest, department: e.target.value})} required>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>{t('time_limit')}</label>
                  <input type="number" value={editingTest.time_limit} onChange={e => setEditingTest({...editingTest, time_limit: e.target.value})} required />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingTest(null)}>{t('cancel')}</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('save')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestList;
