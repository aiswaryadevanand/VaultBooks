


import React, { useEffect, useState } from 'react';
import {
  useGetTransactionsQuery,
  useDeleteTransactionMutation,
} from '../../api/transactionApi';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTransaction } from '../../redux/slices/transactionSlice';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const TransactionList = () => {
  const dispatch = useDispatch();
  const selectedWallet = useSelector((state) => state.wallets.selectedWallet);
  const walletId = selectedWallet?._id;

  const [deleteTransaction] = useDeleteTransactionMutation();
  const { data: transactions = [], isLoading, isError, refetch } = useGetTransactionsQuery(walletId, {
    skip: !walletId,
  });

  useEffect(() => {
    if (walletId) refetch();
  }, [walletId, refetch]);

  const [filters, setFilters] = useState({ category: '', date: '', tags: '' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const categoryOptions = [...new Set(transactions.map((tx) => tx.category).filter(Boolean))];

  const filteredData = transactions.filter((tx) => {
    const matchesCategory = !filters.category || tx.category?.toLowerCase().includes(filters.category.toLowerCase());
    const matchesDate = !filters.date || tx.date?.substring(0, 10) === filters.date;
    const matchesTag = !filters.tags || (tx.tags && tx.tags.some((tag) => tag.toLowerCase().includes(filters.tags.toLowerCase())));
    return matchesCategory && matchesDate && matchesTag;
  });

  if (!walletId) return <p className="text-red-600">⚠️ Please select a wallet to view transactions.</p>;
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500">Error fetching transactions.</p>;

  const hasTransfer = filteredData.some((tx) => tx.type === 'transfer');

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">All Transactions</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select name="category" value={filters.category} onChange={handleFilterChange} className="border p-2 rounded w-40 text-left">
          <option value="">All Categories</option>
          {categoryOptions.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40"
          max={new Date().toISOString().split("T")[0]}
        />

        <input
          name="tags"
          placeholder="Tag"
          value={filters.tags}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40"
        />
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <p className="text-gray-500">You have no transactions.</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500">No transactions match the filters.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Amount</th>
              {hasTransfer && <th className="py-2 px-3">Direction</th>}
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Tags</th>
              <th className="py-2 px-3">Recurring</th>
              <th className="py-2 px-3">Frequency</th>
              <th className="py-2 px-3">File</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((tx) => (
              <tr key={tx._id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-3 capitalize">{tx.type}</td>
                <td className="py-2 px-3">{tx.category}</td>
                <td className="py-2 px-3">₹{tx.amount}</td>
                {hasTransfer && (
                  <td className="py-2 px-3 text-sm text-gray-700">
                    {tx.type === 'transfer'
                      ? `${tx.isMirror ? (tx.toWalletId?.name || 'Unknown') : (tx.walletId?.name || 'Unknown')} → ${tx.isMirror ? (tx.walletId?.name || 'Unknown') : (tx.toWalletId?.name || 'Unknown')}`
                      : '—'}
                  </td>
                )}
                <td className="py-2 px-3">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="py-2 px-3 space-x-1">
                  {tx.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-1 px-2.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="py-2 px-3 text-lg">
                  {tx.recurring ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaTimesCircle className="text-red-600" />
                  )}
                </td>
                <td className="py-2 px-3">{tx.recurring ? tx.frequency || '—' : '—'}</td>
                <td className="py-2 px-3">
                  {tx.fileUrl ? (
                    <a href={`http://localhost:5000/${tx.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      View
                    </a>
                  ) : '—'}
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    {!tx.isMirror && (
                      <button
                        onClick={() => dispatch(setSelectedTransaction(tx))}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteTransaction(tx._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionList;
