
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('App Initialized');

const init = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Could not find root element with id 'root'");
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
