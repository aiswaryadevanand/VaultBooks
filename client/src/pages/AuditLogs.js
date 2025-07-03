
// import React, { useEffect, useState } from 'react';
// import { fetchAuditLogs } from '../api/auditAPI';
// import { useParams } from 'react-router-dom';

// const AuditLogs = () => {
//   const { walletId } = useParams();
//   const [logs, setLogs] = useState([]);
//   const [filters, setFilters] = useState({ action: '', date: '' });

//   const loadLogs = async () => {
//     if (!walletId) return;
//     try {
//       const data = await fetchAuditLogs({ walletId, ...filters });
//       setLogs(data);
//     } catch (err) {
//       console.error("Failed to fetch logs", err);
//       setLogs([]);
//     }
//   };

//   const resetFilters = () => {
//     setFilters({ action: '', date: '' });
//     loadLogs();
//   };

//   useEffect(() => {
//     loadLogs();
//   }, [walletId]);

//   const getShortDetails = (details, action) => {
//     if (!details || typeof details !== 'object') return '-';

//     switch (action) {
//       case 'invite-user':
//         return `Invited Email: ${details.invitedEmail || '-'} | Role: ${details.role || '-'}`;

//       case 'create-reminder':
//         return `Description: ${details.description || '-'} | Due Date: ${details.dueDate ? new Date(details.dueDate).toLocaleDateString() : '-'}`;

//       case 'create-wallet':
//       case 'update-wallet':
//         return `Name: ${details.name || '-'} | Type: ${details.type || '-'}`;

//       case 'create-transaction':
//       case 'update-transaction':
//       case 'delete-transaction':
//         return `Amount: ₹${details.amount || '-'} | Category: ${details.category}`;

//       case 'export-pdf':
//       case 'export-excel':
//         return `Exported Report: ${details?.reportName || 'Unknown'} at ${new Date(details?.exportedAt).toLocaleString()}`;


//       case 'create-transaction-transfer':
//         return `Transfer from ${details?.fromTx?.walletId || '-'} to ${details?.toTx?.walletId || '-'} | Amount: ₹${details?.fromTx?.amount || '-'}`;

//       default:
//         return Object.entries(details)
//           .map(([key, value]) => `${key}: ${value}`)
//           .join(' | ') || '-';
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-semibold text-gray-800 mb-6">🧾 Audit Log Viewer</h1>

//       {/* Filters */}
//       <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//         <input
//           type="text"
//           name="action"
//           placeholder="Action (e.g. create-wallet)"
//           value={filters.action}
//           onChange={(e) => setFilters({ ...filters, action: e.target.value })}
//           className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
//         />
//         <input
//           type="date"
//           name="date"
//           value={filters.date}
//           onChange={(e) => setFilters({ ...filters, date: e.target.value })}
//           className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
//         />
//         <div className="flex gap-2">
//           <button onClick={loadLogs} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
//             Filter
//           </button>
//           <button onClick={resetFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">
//             Reset
//           </button>
//         </div>
//       </div>

//       {/* Logs Table */}
//       {logs.length === 0 ? (
//         <p className="text-gray-600">No logs found for this wallet.</p>
//       ) : (
//         <div className="overflow-x-auto bg-white shadow rounded-lg">
//           <p className="mb-3 text-sm font-medium text-gray-700">Total Logs: {logs.length}</p>
//           <table className="w-full text-left table-auto border-collapse">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr className="text-sm text-gray-600">
//                 <th className="border px-4 py-3">User</th>
//                 <th className="border px-4 py-3">Action</th>
//                 <th className="border px-4 py-3">Details</th>
//                 <th className="border px-4 py-3">Timestamp</th>
//               </tr>
//             </thead>
//             <tbody className="text-sm text-gray-700">
//               {logs.map(log => (
//                 <tr key={log._id} className="hover:bg-gray-50 transition">
//                   <td className="border px-4 py-2">{log.userId?.username || log.userId?.email}</td>
//                   <td className="border px-4 py-2 font-medium text-blue-700">{log.action}</td>
//                   <td className="border px-4 py-2 whitespace-pre-wrap text-sm">{getShortDetails(log.details, log.action)}</td>
//                   <td className="border px-4 py-2">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuditLogs;
import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../api/auditAPI';
import { useParams } from 'react-router-dom';

const AuditLogs = () => {
  const { walletId } = useParams();
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ action: '', date: '' });

  const loadLogs = async () => {
    if (!walletId) return;
    try {
      const data = await fetchAuditLogs({ walletId, ...filters });
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setLogs([]);
    }
  };

  const resetFilters = () => {
    setFilters({ action: '', date: '' });
    loadLogs();
  };

  useEffect(() => {
    loadLogs();
  }, [walletId]);

  const getShortDetails = (details, action) => {
    if (!details || typeof details !== 'object') return '-';

    switch (action) {
      case 'invite-user':
        return `Invited Email: ${details.invitedEmail || '-'} | Role: ${details.role || '-'}`;

      case 'create-reminder':
        return `Description: ${details.description || '-'} | Due Date: ${details.dueDate ? new Date(details.dueDate).toLocaleDateString() : '-'}`;

      case 'create-wallet':
      case 'update-wallet':
        return `Name: ${details.name || '-'} | Type: ${details.type || '-'}`;

      case 'create-transaction':
      case 'update-transaction':
      case 'delete-transaction':
        return `Amount: ₹${details.amount || '-'} | Category: ${details.category}`;

      case 'export-pdf':
      case 'export-excel':
        return `Exported Report: ${details?.reportName || details?.source || 'Unknown'} at ${details?.exportedAt ? new Date(details.exportedAt).toLocaleString() : '-'}`;

      case 'create-transaction-transfer':
        return `Transfer from ${details?.fromTx?.walletId || '-'} to ${details?.toTx?.walletId || '-'} | Amount: ₹${details?.fromTx?.amount || '-'}`;

      default:
        return Object.entries(details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ') || '-';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">🧾 Audit Log Viewer</h1>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          name="action"
          placeholder="Action (e.g. create-wallet)"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <div className="flex gap-2">
          <button onClick={loadLogs} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Filter
          </button>
          <button onClick={resetFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">
            Reset
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <p className="text-gray-600">No logs found for this wallet.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <p className="mb-3 text-sm font-medium text-gray-700">Total Logs: {logs.length}</p>
          <table className="w-full text-left table-auto border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr className="text-sm text-gray-600">
                <th className="border px-4 py-3">User</th>
                <th className="border px-4 py-3">Action</th>
                <th className="border px-4 py-3">Details</th>
                <th className="border px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-gray-50 transition">
                  <td className="border px-4 py-2">{log.userId?.username || log.userId?.email}</td>
                  <td className="border px-4 py-2 font-medium text-blue-700">{log.action}</td>
                  <td className="border px-4 py-2 whitespace-pre-wrap text-sm">{getShortDetails(log.details, log.action)}</td>
                  <td className="border px-4 py-2">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
