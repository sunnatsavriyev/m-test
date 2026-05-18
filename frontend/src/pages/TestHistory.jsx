import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Calendar, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Loading from '../components/Loading';

const TestHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();
  const [results, setResults] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Fetch test details
        const testRes = await axios.get(`${API_URL}tests/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTest(testRes.data);

        // Results are already in the test object's user_results from serializer
        // but we filter them by finished_at descending
        const sortedResults = [...(testRes.data.user_results || [])].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setResults(sortedResults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  if (loading) return <Loading fullPage={false} />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        className="btn btn-secondary" 
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}
        onClick={() => navigate('/tests')}
      >
        <ChevronLeft size={20} />
        Orqaga qaytish
      </button>

      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{test?.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Test topshirishlar tarixi va natijalari</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.length > 0 ? (
          results.map((res, index) => {
            const isSuccess = res.score >= 70;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={res.id} 
                className="card glass test-history-card" 
                style={{ 
                  gap: '32px', 
                  alignItems: 'center',
                  padding: '24px',
                  borderLeft: `6px solid ${isSuccess ? 'var(--success)' : 'var(--error)'}`
                }}
              >
                <div style={{ 
                  background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  color: isSuccess ? 'var(--success)' : 'var(--error)'
                }}>
                  <Award size={28} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Calendar size={16} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600 }}>{new Date(res.date).toLocaleDateString()}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(res.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="var(--primary)" />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {res.correct} / {res.total} to'g'ri javob
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: isSuccess ? 'var(--success)' : 'var(--error)' 
                  }}>
                    {res.score}%
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: isSuccess ? 'var(--success)' : 'var(--error)' }}>
                    {isSuccess ? 'Muvaffaqiyatli' : 'Yiqildi'}
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ padding: '12px 20px', borderRadius: '12px' }}
                  onClick={() => navigate(`/result/${res.id}`)}
                >
                  Batafsil
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            );
          })
        ) : (
          <div className="card glass" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Hali natijalar mavjud emas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistory;
