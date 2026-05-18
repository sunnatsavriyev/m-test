import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Users, FileCheck, Building2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Loading from '../components/Loading';
import { useSettings } from '../context/SettingsContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { API_URL } = useAuth();
  const { t } = useSettings();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}results/stats/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL]);

  if (loading) return <Loading fullPage={false} />;

  const chartData = {
    labels: stats?.top_departments.map(d => d.user__department__name || (d.user__department ? `ID: ${d.user__department}` : 'Noma\'lum')) || [],
    datasets: [
      {
        label: t('chart_hover'),
        data: stats?.top_departments.map(d => d.test_count) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{t('db_title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('db_subtitle')}</p>
      </header>
 
      <div className="dashboard-grid" style={{ padding: 0, marginBottom: '32px' }}>
        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--primary)' }}><Users size={32} /></div>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('total_users')}</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.total_users || 0}</p>
          </div>
        </div>
        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--secondary)' }}><FileCheck size={32} /></div>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('total_tests')}</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.total_tests_taken || 0}</p>
          </div>
        </div>
        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--success)' }}><Building2 size={32} /></div>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('active_services')}</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.total_departments || 0}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card glass">
          <h2 style={{ marginBottom: '24px' }}>{t('chart_title')}</h2>
          <Bar data={chartData} options={{ 
            responsive: true, 
            plugins: { 
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${t('chart_hover')}: ${context.raw}`;
                  }
                }
              }
            },
            scales: { y: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--text-muted)' } }, x: { ticks: { color: 'var(--text-muted)' } } }
          }} />
        </div>
 
        <div className="card glass">
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Trophy color="var(--warning)" /> {t('ranking_title')}</h2>
          <div className="ranking-list">
            {stats?.global_ranking.map((user, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '28px', height: '28px', background: index < 3 ? 'var(--warning)' : 'var(--surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{index + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{user.user__first_name} {user.user__last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.user__department__name || (user.user__department ? `ID: ${user.user__department}` : '')}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{Math.round(user.avg_score)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
