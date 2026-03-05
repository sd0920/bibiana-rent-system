import React from 'react';

const RoomStatus = () => {
  // Example data - this will eventually come from your database
  const rooms = [
    { id: '101', status: 'Occupied' },
    { id: '102', status: 'Vacant' },
    { id: '103', status: 'Vacant' },
    { id: '104', status: 'Occupied' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔑 Room Status</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {rooms.map(room => (
          <div key={room.id} style={{
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: room.status === 'Vacant' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${room.status === 'Vacant' ? '#22c55e' : '#ef4444'}`
          }}>
            <strong>Room {room.id}</strong>
            <p>{room.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomStatus;