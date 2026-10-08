import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { warmupBackendServer } from './config';

// Pre-warm remote backend on startup (wakes up sleeping Render instance)
warmupBackendServer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
