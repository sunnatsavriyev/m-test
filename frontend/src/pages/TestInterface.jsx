import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

import { useToast } from '../components/Toast';

const TestInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();
  const { addToast } = useToast();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [resultId, setResultId] = useState(null);
  const [sessionToken, setSessionToken] = useState(localStorage.getItem(`test_session_${id}`));
  const hasStarted = React.useRef(false);

  const isTimeLow = timeLeft < 60;

  const fetchTestData = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    try {
      const token = localStorage.getItem('access_token');
      
      // Avval testni boshlash/davom ettirishni tekshirish
      const startRes = await axios.post(`${API_URL}results/start/`, {
        test_id: id,
        session_token: sessionToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResultId(startRes.data.result_id);
      if (startRes.data.session_token) {
        setSessionToken(startRes.data.session_token);
        localStorage.setItem(`test_session_${id}`, startRes.data.session_token);
      }

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
      hasStarted.current = false; // Xatolik bo'lsa qaytadan urinishga ruxsat
      const errorMsg = err.response?.data?.error || "Testni boshlashda xatolik yuz berdi";
      addToast(errorMsg, "error");
      navigate('/tests');
    }
  }, [id, API_URL, navigate, sessionToken, addToast]);

  useEffect(() => {
    fetchTestData();
  }, []); // Only once on mount

  const submitTest = useCallback(async (cheated = false, details = '') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}results/submit/`, {
        test_id: id,
        result_id: resultId,
        session_token: sessionToken,
        answers: answers,
        question_ids: questions.map(q => q.id),
        is_cheated: cheated, // Faqatgina majburiy yakunlanganda (2-marta chiqqanda) true bo'ladi
        cheat_attempts: cheatAttempts,
        cheat_details: cheated ? details : ""
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
      setIsFinished(true);
      localStorage.removeItem(`test_session_${id}`);
      addToast("Test muvaffaqiyatli yakunlandi!", "success");
    } catch (err) {
      console.error(err);
      addToast("Natijani saqlashda xatolik yuz berdi!", "error");
    }
  }, [id, answers, questions, cheatAttempts, API_URL, resultId, sessionToken, addToast]);

  // Anti-Cheat Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setCheatAttempts(prev => {
          const next = prev + 1;
          if (next === 1) {
            setShowWarning(true);
          } else if (next >= 2) {
            submitTest(true, "Browserdan chiqdi (Avtomatik yakunlash)");
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
      <div className="test-container animate-fade-in" style={{ maxWidth: '800px', padding: '0 20px' }}>
        <div className="card glass" style={{ textAlign: 'center', padding: '48px', marginBottom: '32px' }}>
          {result?.is_cheated ? (
            <>
              <AlertTriangle size={80} color="var(--error)" style={{ margin: '0 auto 24px' }} />
              <h1 style={{ marginBottom: '12px', color: 'var(--error)' }}>Test avtomatik yakunlandi!</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '16px' }}>
                Qoidabuzarlik (brauzerdan chiqish) sababli test to'xtatildi.
              </p>
            </>
          ) : (
            <>
              <CheckCircle size={80} color="var(--success)" style={{ margin: '0 auto 24px' }} />
              <h1 style={{ marginBottom: '12px' }}>Test yakunlandi!</h1>
            </>
          )}
          
          <div style={{ fontSize: '3rem', fontWeight: 800, color: result?.is_cheated ? 'var(--error)' : 'var(--primary)', marginBottom: '8px' }}>
            {result?.score}%
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '32px' }}>
            {result?.correct_answers} ta to'g'ri javob ({result?.total_questions} tadan)
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/tests')}>Asosiy sahifaga qaytish</button>
        </div>

        <h2 style={{ marginBottom: '24px' }}>Savollar tahlili</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const answerDetail = result?.answers?.find(a => a.question === q.id);
            const correctChoiceId = answerDetail?.correct_choice;

            return (
              <div key={q.id} className="card glass" style={{ borderLeft: `4px solid ${answerDetail?.is_correct ? 'var(--success)' : 'var(--error)'}` }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{idx + 1}. {q.text}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.choices.map(choice => {
                    const isSelected = userAnswer === choice.id;
                    const isCorrect = choice.id === correctChoiceId;
                    
                    let bg = 'transparent';
                    let border = '1px solid var(--border)';
                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.1)';
                      border = '1px solid var(--success)';
                    } else if (isSelected && !isCorrect) {
                      bg = 'rgba(239, 68, 68, 0.1)';
                      border = '1px solid var(--error)';
                    }

                    return (
                      <div key={choice.id} style={{ padding: '12px 16px', borderRadius: '8px', background: bg, border: border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{choice.text}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isCorrect && <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>TO'G'RI</span>}
                          {isSelected && !isCorrect && <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 700 }}>SIZNING JAVOB</span>}
                          {isCorrect && <CheckCircle size={16} color="var(--success)" />}
                          {isSelected && !isCorrect && <AlertTriangle size={16} color="var(--error)" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {answerDetail?.explanation && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>Izoh:</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>{answerDetail.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: isTimeLow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', padding: '8px 16px', borderRadius: 'var(--radius)', color: isTimeLow ? 'var(--error)' : 'var(--primary)', fontWeight: 700 }}>
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

      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card glass" 
              style={{ width: '100%', maxWidth: '450px', textAlign: 'center', padding: '40px' }}
            >
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <AlertTriangle size={40} color="var(--warning)" />
              </div>
              <h2 style={{ marginBottom: '16px', fontSize: '1.8rem', fontWeight: 800 }}>DIQQAT!</h2>
              <p style={{ color: 'var(--text)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: 1.6 }}>
                Siz test sahifasidan chiqdingiz. Agar yana bir bor shunday holat takrorlansa, test <span style={{ color: 'var(--error)', fontWeight: 700 }}>avtomatik yakunlanadi</span> va ballingiz pasaytirilishi mumkin!
              </p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={() => setShowWarning(false)}>TUSHUNDIM, DAVOM ETAMAN</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestInterface;
