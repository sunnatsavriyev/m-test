import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, FileText, Upload, Plus, Trash2, X, Award } from 'lucide-react';
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18} color="var(--primary)" /> {test.time_limit} daqiqa</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={18} color="var(--primary)" /> {test.question_count} ta savol</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => navigate(`/test/${test.id}/history`)}
              >
                <Award size={18} />
                Natijalar
              </button>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => navigate(`/test/${test.id}`)}
                disabled={user?.role === 'monitoring'}
              >
                <Play size={18} fill="currentColor" />
                Testni boshlash
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestList;
