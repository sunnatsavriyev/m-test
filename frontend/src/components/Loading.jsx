import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ fullPage = true }) => {
  const containerStyle = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'var(--background)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  } : {
    width: '100%',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  };

  return (
    <div style={containerStyle}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <motion.div
          animate={{
            rotate: 360,
            borderRadius: ["20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: '100%',
            height: '100%',
            border: '4px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            width: '50px',
            height: '50px',
            border: '4px solid var(--accent)',
            borderBottomColor: 'transparent',
            borderRadius: '50%',
          }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          marginTop: '24px',
          fontSize: '1.1rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: 'var(--text)',
          textTransform: 'uppercase'
        }}
      >
        Yuklanmoqda...
      </motion.p>
    </div>
  );
};

export default Loading;
