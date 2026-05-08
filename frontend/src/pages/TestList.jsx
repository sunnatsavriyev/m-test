import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, FileText, Upload, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestList = () => {
  const { API_URL, user } = useAuth();
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  
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

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Testlar</h1>
          <p style={{ color: 'var(--text-muted)' }}>Mavjud testlar ro'yxati</p>
        </div>
        {(user?.role === 'super_admin' || user?.role === 'dept_head') && (
          <button className="btn btn-primary" onClick={() => navigate('/test/create')}>
            <Upload size={20} />
            Yangi test yaratish
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
            
            {test.user_results && test.user_results.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: 'var(--primary)' }}>Sizning natijalaringiz (ko'rish uchun bosing):</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {test.user_results.map(res => (
                    <div 
                      key={res.id} 
                      onClick={() => navigate(`/result/${res.id}`)}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '0.75rem', 
                        padding: '6px 8px', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'var(--transition)'
                      }}
                      className="result-item-hover"
                    >
                      <span>{new Date(res.date).toLocaleDateString()}</span>
                      <span style={{ fontWeight: 700, color: res.score >= 70 ? 'var(--success)' : 'var(--error)' }}>
                        {res.score}% ({res.correct}/{res.total})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
    </div>
  );
};

export default TestList;
