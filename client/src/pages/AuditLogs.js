import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../api/auditAPI';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    userId: '',
    walletId: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const loadLogs = async () => {
    try {
      const data = await fetchAuditLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error("❌ Failed to fetch logs", err.response?.data || err.message);
      setLogs([]);
    }
  };

  const resetFilters = () => {
    const cleared = {
      userId: '',
      walletId: '',
      action: '',
      startDate: '',
      endDate: ''
    };
    setFilters(cleared);
    loadLogs();
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Audit Log Dashboard</h2>

      {/* Filter Section */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={filters.userId}
          onChange={handleChange}
        />
        <input
          type="text"
          name="walletId"
          placeholder="Wallet ID"
          value={filters.walletId}
          onChange={handleChange}
        />
        <input
          type="text"
          name="action"
          placeholder="Action"
          value={filters.action}
          onChange={handleChange}
        />
        <input
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleChange}
        />
        <input
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleChange}
        />
        <button onClick={loadLogs}>Filter</button>
        <button onClick={resetFilters} style={{ backgroundColor: '#ccc' }}>Reset</button>
      </div>

      {/* Log Table */}
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <>
          <p><strong>Total logs:</strong> {logs.length}</p>
          <table border="1" cellPadding="10" cellSpacing="0" width="100%">
            <thead style={{ backgroundColor: '#f0f0f0' }}>
              <tr>
                <th>User</th>
                <th>Wallet</th>
                <th>Action</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>{log.userId?.username || log.userId?.email || 'N/A'}</td>
                  <td>{log.walletId?.name || 'N/A'}</td>
                  <td>{log.action}</td>
                  <td>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                  <td>{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AuditLogs;
