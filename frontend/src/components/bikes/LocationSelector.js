// frontend/src/components/bikes/LocationSelector.js
import React from 'react';

function LocationSelector({ selectedLocation, setSelectedLocation, locations }) {
  return (
    <div className="location-selector mb-4">
      <h5>Select a Location for Rental</h5>
      <select 
        className="form-select" 
        value={selectedLocation} 
        onChange={(e) => setSelectedLocation(e.target.value)}
      >
        <option value="">Select a city...</option>
        {locations.map(location => (
          <option key={location.id || location._id} value={location.id || location._id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LocationSelector;