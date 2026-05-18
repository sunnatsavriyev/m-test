import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertTriangle, ArrowLeft, Clock, User, FileText } from 'lucide-react';
import Loading from '../components/Loading';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}results/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResult(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, API_URL]);

  if (loading) return <Loading fullPage={false} />;
  if (!result) return <div className="main-content">Natija topilmadi.</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary" 
        style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={18} /> Orqaga qaytish
      </button>

      <div className="card glass" style={{ marginBottom: '32px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{result.test_detail.title}</h1>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={16} /> {result.user_detail.first_name} {result.user_detail.last_name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {new Date(result.completed_at).toLocaleString()}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: result.score >= 70 ? 'var(--success)' : 'var(--error)' }}>
              {Math.round(result.score)}%
            </div>
            <p style={{ color: 'var(--text-muted)' }}>{result.correct_answers} / {result.total_questions} to'g'ri</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FileText size={24} /> Savollar tahlili
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {result.answers.map((answer, idx) => (
          <div key={answer.id} className="card glass" style={{ borderLeft: `4px solid ${answer.is_correct ? 'var(--success)' : 'var(--error)'}` }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{idx + 1}. {answer.question_text}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Note: We don't have all choices here, only the selected and correct ones. 
                  But we can show what the user selected and what was correct. */}
              
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: answer.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${answer.is_correct ? 'var(--success)' : 'var(--error)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, marginBottom: '4px' }}>SIZNING JAVOBINGIZ:</p>
                  <span>{answer.selected_choice_text || '(Javob berilmagan)'}</span>
                </div>
                {answer.is_correct ? <CheckCircle size={20} color="var(--success)" /> : <AlertTriangle size={20} color="var(--error)" />}
              </div>

              {!answer.is_correct && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--success)', borderStyle: 'dashed' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>TO'G'RI JAVOB:</p>
                  <span>{answer.correct_choice_text}</span>
                </div>
              )}
            </div>

            {answer.explanation && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>Izoh:</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>{answer.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDetail;
