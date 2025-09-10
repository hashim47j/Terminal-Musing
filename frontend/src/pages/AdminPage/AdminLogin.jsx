import React, { useState, useRef, useEffect } from 'react';
import './AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [showComicMessage, setShowComicMessage] = useState(false);
  const [showCassetteOverlay, setShowCassetteOverlay] = useState(false);
  const [isKeyInserted, setIsKeyInserted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyContent, setKeyContent] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const fileInputRef = useRef(null);
  const lastTapRef = useRef(0);
  const tapCounterRef = useRef(0);

  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 500) {
      tapCounterRef.current += 1;
      if (tapCounterRef.current === 3) {
        setShowCassetteOverlay(true);
        tapCounterRef.current = 0;
      }
    } else {
      tapCounterRef.current = 1;
    }
    lastTapRef.current = now;
  };

  const handleKeyInsert = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result.trim();
        setKeyContent(content);
        setIsKeyInserted(true);
        setError('');
        setStatus('Key loaded successfully');
      };

      reader.onerror = () => {
        setError('Failed to read key file');
        setIsKeyInserted(false);
      };

      reader.readAsText(file);
    }
  };

  const handlePlayButtonClick = async () => {
    if (!isKeyInserted || !keyContent) {
      setError('No key inserted');
      return;
    }

    setIsPlaying(true);
    setError('');
    setStatus('🎵 Verifying authentication...');

    const result = await login(keyContent);

    if (result.success) {
      setStatus('✅ Authentication successful!');
      setTimeout(() => {
        setStatus('📁 Accessing admin panel...');
        setTimeout(() => {
          setIsPlaying(false);
          setShowCassetteOverlay(false);
          navigate('/admin/dashboard');
        }, 1500);
      }, 1000);
    } else {
      setError(result.message || 'Authentication failed');
      setIsPlaying(false);
      setStatus('');
    }
  };

  const handleRewindButtonClick = () => {
    if (isPlaying) return;
    setIsKeyInserted(false);
    setKeyContent('');
    setError('');
    setStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    if (!isPlaying) {
      fileInputRef.current.click();
    }
  };

  const handleDismissCassette = () => {
    if (isPlaying) return;
    setShowCassetteOverlay(false);
    setIsPlaying(false);
    setIsKeyInserted(false);
    setKeyContent('');
    setError('');
    setStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isPlaying) {
      handleDismissCassette();
    }
  };

  const handleForgotPasswordClick = (event) => {
    event.preventDefault();
    setShowComicMessage(true);
  };

  const handleCloseComicMessage = () => {
    setShowComicMessage(false);
  };

  return (
    <div className="login-wrapper">
      <div
        data-navbar-bg-detect
        style={{ position: 'absolute', top: 0, height: '80px', width: '100%' }}
      />

      <div className="login-main-content">
        <form className="login-form">
          <h2>Only for the author(s)</h2>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <div className="login-links">
            <a href="#" onClick={handleForgotPasswordClick}>Forgot Password?</a>
            {showComicMessage && (
              <div className="comic-message-box">
                <p>there is no room to forget anything</p>
                <button className="close-comic-btn" onClick={handleCloseComicMessage}>X</button>
              </div>
            )}
          </div>
          <button type="submit" disabled>Login</button>
        </form>

        <div className="login-image-container">
          <img src="/images/login-sketch.png" alt="Lightning sketch" />
        </div>
      </div>

      <div className="author-footer">
        <img
          src="/images/abstract-author-icon.png"
          alt="Abstract Author Icon"
          onClick={handleImageTap}
          style={{ cursor: 'pointer' }}
        />
        <p></p>
      </div>

      {showCassetteOverlay && (
        <div className="key-overlay" onClick={handleOverlayClick}>
          <div className={`cassette-ui ${isKeyInserted ? 'key-inserted' : ''} ${isPlaying ? 'playing' : ''}`}>
            <img
              src="/images/Minimalistic_Black-and-White_Line_Drawing_Of_An_Audio_Cassette-removebg-preview.png"
              alt="Cassette Outline"
              className="cassette-outline"
            />

            <input
              type="file"
              ref={fileInputRef}
              className="hidden-input"
              onChange={handleKeyInsert}
              accept=".txt,.key,.hash"
              disabled={isPlaying}
            />

            <div className="reel-container reel-left">
              <div className={`reel ${isPlaying ? 'playing' : ''}`}></div>
            </div>
            <div className="reel-container reel-right">
              <div className={`reel ${isPlaying ? 'playing' : ''}`}></div>
            </div>

            <div className="insert-key-container">
              <button 
                className="insert-key-button" 
                onClick={triggerFileInput}
                disabled={isPlaying}
              >
                {isKeyInserted ? 'Key Ready' : 'Insert Key'}
              </button>
              
              {status && <div className="status-message">{status}</div>}
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="playback-controls">
              <button 
                className="rewind-button" 
                onClick={handleRewindButtonClick}
                disabled={isPlaying}
                title="Reset cassette"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M11 19L2 12L11 5V19ZM22 19L13 12L22 5V19Z" fill="black"/>
                </svg>
              </button>
              <button 
                className="play-button" 
                onClick={handlePlayButtonClick}
                disabled={!isKeyInserted || loading}
                title="Verify authentication"
              >
                {loading ? "..." : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    {isPlaying ? (
                      <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="black"/>
                    ) : (
                      <path d="M8 5V19L19 12L8 5Z" fill="black"/>
                    )}
                  </svg>
                )}
              </button>
            </div>

            <button 
              className="dismiss-button" 
              onClick={handleDismissCassette}
              disabled={isPlaying}
              title="Close cassette player"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
