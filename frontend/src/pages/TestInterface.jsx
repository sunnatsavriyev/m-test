import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const TestInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const fetchTestData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const testRes = await axios.get(`${API_URL}tests/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTest(testRes.data);
      setTimeLeft(testRes.data.time_limit * 60);

      const questRes = await axios.get(`${API_URL}tests/${id}/questions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questRes.data);
    } catch (err) {
      console.error(err);
      navigate('/tests');
    }
  }, [id, API_URL, navigate]);

  useEffect(() => {
    fetchTestData();
  }, [fetchTestData]);

  const submitTest = useCallback(async (cheated = false) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}results/submit/`, {
        test_id: id,
        answers: answers,
        is_cheated: cheated || cheatAttempts > 0,
        cheat_attempts: cheatAttempts
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFinished(true);
    } catch (err) {
      alert("Natijani saqlashda xatolik!");
    }
  }, [id, answers, cheatAttempts, API_URL]);

  // Anti-Cheat Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setCheatAttempts(prev => {
          const next = prev + 1;
          if (next === 1) {
            setShowWarning(true);
          } else if (next >= 2) {
            submitTest(true);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFinished, submitTest]);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0 || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, submitTest]);

  const handleAnswer = (questionId, choiceId) => {
    setAnswers({ ...answers, [questionId]: choiceId });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!test || questions.length === 0) return <div>Yuklanmoqda...</div>;

  if (isFinished) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '24px' }} />
        <h1 style={{ marginBottom: '12px' }}>Test yakunlandi!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Natijangiz saqlandi. Monitoring bo'limidan ko'rishingiz mumkin.</p>
        <button className="btn btn-primary" onClick={() => navigate('/tests')}>Testlar ro'yxatiga qaytish</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="test-container animate-fade-in">
      <div className="card glass" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '24px', zIndex: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem' }}>{test.title}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Savol {currentIndex + 1} / {questions.length}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', padding: '8px 16px', borderRadius: 'var(--radius)', color: timeLeft < 60 ? 'var(--error)' : 'var(--primary)', fontWeight: 700 }}>
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="card glass"
          style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}
        >
          <h2 style={{ marginBottom: '32px', fontSize: '1.5rem', lineHeight: 1.4 }}>{currentQuestion.text}</h2>
          
          <div className="options">
            {currentQuestion.choices.map(choice => (
              <div 
                key={choice.id} 
                className={`option-card ${answers[currentQuestion.id] === choice.id ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQuestion.id, choice.id)}
              >
                {choice.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', paddingTop: '32px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0}
            >
              Oldingisi
            </button>
            {currentIndex === questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => submitTest()}>Yakunlash</button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentIndex(prev => prev + 1)}>Keyingisi</button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {showWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={64} color="var(--warning)" style={{ marginBottom: '24px' }} />
            <h2 style={{ marginBottom: '12px' }}>Ogohlantirish!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Siz test sahifasidan chiqdingiz. Agar yana bir bor shunday holat takrorlansa, test avtomatik yakunlanadi!</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowWarning(false)}>Tushundim</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
