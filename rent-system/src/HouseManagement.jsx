import React, { useState } from 'react';

const HouseManagement = () => {
  const [houses, setHouses] = useState([
    { id: 1, name: 'Bibiana Main', location: 'Dar', rooms: 5 },
  ]);

  const deleteHouse = (id) => {
    if(window.confirm("Are you sure you want to delete this house?")) {
      setHouses(houses.filter(h => h.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🏠 House Management</h2>
      {/* Form to add house would go here */}
      
      <div className="mt-6 space-y-4">
        {houses.map(h => (
          <div key={h.id} className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm">
            <div>
              <p className="font-bold">{h.name}</p>
              <p className="text-sm text-slate-500">{h.location} - {h.rooms} Rooms</p>
            </div>
            <button 
              onClick={() => deleteHouse(h.id)}
              className="bg-rose-100 text-rose-600 px-4 py-2 rounded-lg font-bold hover:bg-rose-200"
            >
              Delete House
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HouseManagement;