import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(toast => {
            const borderColor = toast.type === 'error' ? 'var(--error)' : 
                               toast.type === 'success' ? 'var(--success)' : 'var(--primary)';
            
            return (
              <motion.div
                key={toast.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                style={{ 
                  pointerEvents: 'auto',
                  background: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: '300px',
                  maxWidth: '400px'
                }}
              >
                {toast.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
                {toast.type === 'error' && <AlertCircle size={20} color="var(--error)" />}
                {toast.type === 'info' && <Info size={20} color="var(--primary)" />}
                
                <span style={{ fontSize: '0.9rem', flex: 1 }}>{toast.message}</span>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
