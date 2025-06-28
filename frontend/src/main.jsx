// Terminal-Musing/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/index.css'; // Your global stylesheet
import { DarkModeProvider } from './context/DarkModeContext.jsx'; // ⬅️ Import context

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider> {/* ⬅️ Wrap app in DarkMode context */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DarkModeProvider>
  </React.StrictMode>,
);
