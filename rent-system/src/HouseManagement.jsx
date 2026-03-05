import React, { useState } from 'react';

const HouseManagement = () => {
  const [house, setHouse] = useState({ name: '', location: '', rooms: '' });

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏠 House Management</h2>
      <div className="card" style={{ padding: '20px', maxWidth: '400px', border: '1px solid #ddd' }}>
        <label>House Name</label>
        <input type="text" placeholder="e.g. Bibiana Annex" 
               onChange={(e) => setHouse({...house, name: e.target.value})} />
        
        <label>Location</label>
        <input type="text" placeholder="e.g. Dar es Salaam" 
               onChange={(e) => setHouse({...house, location: e.target.value})} />
        
        <label>Number of Rooms</label>
        <input type="number" placeholder="Total rooms" 
               onChange={(e) => setHouse({...house, rooms: e.target.value})} />
        
        <button style={{ marginTop: '10px', backgroundColor: '#2563eb', color: 'white' }}>
          Add Property
        </button>
      </div>
    </div>
  );
};

export default HouseManagement;