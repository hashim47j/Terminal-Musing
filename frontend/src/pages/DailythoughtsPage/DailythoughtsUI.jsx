import React, { useState } from 'react';
import './DailythoughtsUI.css';

const DailythoughtsUI = () => {
  const [isLongThought, setIsLongThought] = useState(false);
  const [words, setWords]   = useState('');
  const [title, setTitle]   = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState(null);

  const toggleThoughtType = () => {
    setIsLongThought((prev) => !prev);
    setWords(''); setTitle(''); setMessage(null);
  };

  const handleSubmit = async () => {
    if (!author || !words.trim()) {
      setMessage('⚠️ Please fill in all required fields.');
      return;
    }

    const thought = {
      name: author,
      contact: email,
      content: isLongThought ? `${title ? title + '\n\n' : ''}${words}` : words,
      type: isLongThought ? 'long' : 'short',
    };

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await fetch('/api/dailythoughts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thought),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || '✅ Submitted!');
        setWords(''); setTitle(''); setAuthor(''); setEmail('');
      } else {
        setMessage(data.message || '❌ Failed to submit.');
      }
    } catch {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dailythoughts-wrapper">
      <div className={`thought-toggle ${isLongThought ? 'long-thought-active' : ''}`}>
        <div className={`toggle-option ${!isLongThought ? 'active' : ''}`} onClick={() => setIsLongThought(false)}>
          A small thought
        </div>
        <div className={`toggle-option ${isLongThought ? 'active' : ''}`} onClick={() => setIsLongThought(true)}>
          Do you’ve more things to say?
        </div>
      </div>

      {isLongThought && (
        <input
          type="text"
          className="thought-title"
          placeholder="Title of your thought"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      )}

      <textarea
        className="thought-textarea"
        placeholder="Words"
        value={words}
        maxLength={isLongThought ? 1_000 : 100}
        onChange={(e) => setWords(e.target.value)}
      />

      <div className="submission-footer">
        <div className="contact-fields">
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="post-message">
          <p>
            When you tap on post, it won’t actually post. The content will be reached to me, I
            will review and post it as soon as possible…
          </p>
        </div>

        {message && <div className="submit-feedback">{message}</div>}

        <button className="post-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default DailythoughtsUI;
