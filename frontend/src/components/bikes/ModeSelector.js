// frontend/src/components/bikes/ModeSelector.js
import React from 'react';

function ModeSelector({ mode, setMode }) {
  return (
    <div className="mode-selector mb-4">
      <div className="btn-group w-100">
        <button 
          className={`btn ${mode === 'purchase' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setMode('purchase')}
        >
          <i className="bi bi-cart-plus me-2"></i>
          Buy Bicycles
        </button>
        <button 
          className={`btn ${mode === 'rental' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setMode('rental')}
        >
          <i className="bi bi-bicycle me-2"></i>
          Rent Bicycles
        </button>
      </div>
    </div>
  );
}

export default ModeSelector;