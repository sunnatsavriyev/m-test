import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, RotateCcw, ShieldAlert } from 'lucide-react';

const Monitoring = () => {
  const { API_URL, user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}results/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const resetResult = async (id) => {
    if (window.confirm("Haqiqatdan bu natijani o'chirib, qayta topshirishga ruxsat bermoqchimisiz?")) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post(`${API_URL}results/${id}/reset/`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchResults();
      } catch (err) {
        alert("Xatolik yuz berdi!");
      }
    }
  };

  const filteredResults = results.filter(r => 
    r.user_detail.first_name.toLowerCase().includes(filter.toLowerCase()) ||
    r.user_detail.last_name.toLowerCase().includes(filter.toLowerCase()) ||
    r.test_detail.title.toLowerCase().includes(filter.toLowerCase()) ||
    (r.user_detail.department_name && r.user_detail.department_name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Monitoring</h1>
          <p style={{ color: 'var(--text-muted)' }}>Test natijalari va statistikasi</p>
        </div>
      </header>

      <div className="card glass" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Ism, xizmat yoki test nomi bo'yicha qidirish..." 
          style={{ border: 'none', background: 'transparent', padding: '8px', width: '100%' }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px' }}>Foydalanuvchi</th>
              <th style={{ padding: '16px' }}>Xizmat</th>
              <th style={{ padding: '16px' }}>Test</th>
              <th style={{ padding: '16px' }}>Natija</th>
              <th style={{ padding: '16px' }}>Sana</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map(res => {
              const scoreColor = res.score >= 60 ? 'var(--success)' : 'var(--error)';
              
              return (
                <tr key={res.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600 }}>{res.user_detail.first_name} {res.user_detail.last_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{res.user_detail.username}</div>
                  </td>
                  <td style={{ padding: '16px' }}>{res.user_detail.department_name || '—'}</td>
                  <td style={{ padding: '16px' }}>{res.test_detail.title}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: scoreColor }}>{Math.round(res.score)}%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{res.correct_answers} / {res.total_questions}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.85rem' }}>{new Date(res.completed_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    {res.is_cheated ? (
                      <div style={{ color: 'var(--error)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <ShieldAlert size={14} /> Aldash holati ({res.cheat_attempts})
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
                          {res.cheat_details || 'Noma\'lum sabab'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Toza</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {user?.role === 'super_admin' && (
                      <button className="btn btn-secondary" style={{ padding: '6px' }} title="Qayta ishlashga ruxsat" onClick={() => resetResult(res.id)}>
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Monitoring;
