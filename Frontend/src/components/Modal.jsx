function Modal({ message, onClose }) {
  if (!message) return null

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <div style={glowEffect} />
        <div style={headerStyle}>
          <span style={dangerIcon}>⚠</span>
          <span style={titleStyle}>DANGER</span>
          <span style={dangerIcon}>⚠</span>
        </div>
        <div style={dividerStyle} />
        <p style={messageStyle}>{message}</p>
        <div style={buttonContainerStyle}>
          <button 
            onClick={onClose}
            style={buttonStyle}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <span style={buttonTextStyle}>✕ TERMINATE</span>
          </button>
        </div>
        <div style={scanlineStyle} />
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
  animation: 'fadeIn 0.3s ease-out',
  zIndex: 9999,
}

const boxStyle = {
  background: 'linear-gradient(145deg, #1a0000, #2d0000)',
  padding: '32px',
  borderRadius: '12px',
  maxWidth: '450px',
  width: '90%',
  textAlign: 'center',
  position: 'relative',
  border: '2px solid #ff0000',
  boxShadow: '0 0 40px rgba(255,0,0,0.3), 0 0 80px rgba(255,0,0,0.1), inset 0 0 40px rgba(255,0,0,0.05)',
  animation: 'glitchPulse 2s ease-in-out infinite',
  overflow: 'hidden',
}

const glowEffect = {
  position: 'absolute',
  top: '-50%',
  left: '-50%',
  width: '200%',
  height: '200%',
  background: 'radial-gradient(circle at center, rgba(255,0,0,0.1) 0%, transparent 70%)',
  animation: 'rotateGlow 4s linear infinite',
  pointerEvents: 'none',
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '8px',
  position: 'relative',
  zIndex: 1,
}

const dangerIcon = {
  fontSize: '28px',
  animation: 'blinkWarning 1s ease-in-out infinite',
}

const titleStyle = {
  fontSize: '28px',
  fontWeight: '900',
  color: '#ff0000',
  textShadow: '0 0 20px rgba(255,0,0,0.5), 0 0 40px rgba(255,0,0,0.3), 0 0 80px rgba(255,0,0,0.2)',
  letterSpacing: '4px',
  fontFamily: 'monospace',
}

const dividerStyle = {
  height: '2px',
  background: 'linear-gradient(90deg, transparent, #ff0000, transparent)',
  margin: '12px 0 20px 0',
  position: 'relative',
  zIndex: 1,
  boxShadow: '0 0 20px rgba(255,0,0,0.3)',
}

const messageStyle = {
  color: '#ff6b6b',
  fontSize: '18px',
  lineHeight: '1.6',
  marginBottom: '28px',
  position: 'relative',
  zIndex: 1,
  fontFamily: 'monospace',
  textShadow: '0 0 10px rgba(255,0,0,0.2)',
}

const buttonContainerStyle = {
  position: 'relative',
  zIndex: 1,
}

const buttonStyle = {
  background: 'linear-gradient(135deg, #ff0000, #cc0000)',
  color: 'white',
  border: 'none',
  padding: '14px 40px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  boxShadow: '0 0 30px rgba(255,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: 'monospace',
}

const buttonTextStyle = {
  position: 'relative',
  zIndex: 2,
}

const scanlineStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '2px',
  background: 'rgba(255,0,0,0.1)',
  animation: 'scanline 2s linear infinite',
  pointerEvents: 'none',
}

// Add these keyframes to your global CSS or style tag
const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes glitchPulse {
    0%, 100% { box-shadow: 0 0 40px rgba(255,0,0,0.3), 0 0 80px rgba(255,0,0,0.1); }
    50% { box-shadow: 0 0 60px rgba(255,0,0,0.5), 0 0 120px rgba(255,0,0,0.2), 0 0 200px rgba(255,0,0,0.1); }
  }

  @keyframes rotateGlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes blinkWarning {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes scanline {
    0% { top: 0; }
    100% { top: 100%; }
  }

  @keyframes buttonPulse {
    0%, 100% { box-shadow: 0 0 30px rgba(255,0,0,0.3); }
    50% { box-shadow: 0 0 50px rgba(255,0,0,0.6), 0 0 80px rgba(255,0,0,0.3); }
  }
`

// Add style tag for animations
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style')
  styleTag.textContent = keyframes
  document.head.appendChild(styleTag)
}

export default Modal