import React from 'react';

const PaymentHistory = () => {
  const payments = [
    { date: '2026-03-01', tenant: 'John Doe', amount: '50,000/-', status: 'Paid' },
    { date: '2026-03-02', tenant: 'Jane Smith', amount: '120,000/-', status: 'Paid' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>💰 Payment History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Date</th>
            <th style={{ padding: '10px' }}>Tenant</th>
            <th style={{ padding: '10px' }}>Amount</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{p.date}</td>
              <td style={{ padding: '10px' }}>{p.tenant}</td>
              <td style={{ padding: '10px' }}>{p.amount}</td>
              <td style={{ padding: '10px', color: 'green' }}>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;