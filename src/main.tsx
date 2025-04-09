
import React from 'react-dom/client'
import { createElement } from 'react'
import App from './App.tsx'
import './index.css'

// Make React available globally to ensure all dependencies can access it
window.React = React;

createRoot(document.getElementById("root")!).render(
  createElement(App)
);
