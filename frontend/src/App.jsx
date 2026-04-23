import React from 'react';
import { UploadSection } from './components/UploadSection';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="navbar">
        <h1> WhatsApp Analyzer - Equipo 10</h1>
      </header>

      {/* Sección principal (Hero) */}
      <main className="main-content">
        <UploadSection />
        
        
      </main>
    </div>
  );
}

export default App;