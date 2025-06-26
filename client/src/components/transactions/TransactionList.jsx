
import React, { useState } from 'react';
import {
  useGetTransactionsQuery,
  useDeleteTransactionMutation,
} from '../../api/transactionApi';
import { useDispatch } from 'react-redux';
import { setSelectedTransaction } from '../../redux/slices/transactionSlice';

const TransactionList = () => {
  const { data = [], isLoading, isError } = useGetTransactionsQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({
    category: '',
    walletId: '',
    date: '',
    tags: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Optional: Unique category list for dropdown
  const categoryOptions = [...new Set(data.map((tx) => tx.category))].filter(Boolean);

  const filteredData = data.filter((tx) => {
    const matchesCategory = !filters.category || tx.category?.toLowerCase().includes(filters.category.toLowerCase());
    const matchesWallet = !filters.walletId || tx.walletId === filters.walletId;
    const matchesDate = !filters.date || tx.date?.substring(0, 10) === filters.date;
    const matchesTag =
      !filters.tags ||
      (tx.tags && tx.tags.some((tag) =>
        tag.toLowerCase().includes(filters.tags.toLowerCase())
      ));

    return matchesCategory && matchesWallet && matchesDate && matchesTag;
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500">Error fetching transactions.</p>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">All Transactions</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40 text-left"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          name="walletId"
          placeholder="Wallet ID"
          value={filters.walletId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40"
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40"
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
      {filteredData.length === 0 ? (
        <p className="text-gray-500">No transactions match the filters.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Amount</th>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Tags</th>
              <th className="py-2 px-4 text-left">File</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((tx) => (
              <tr key={tx._id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{tx.type}</td>
                <td className="py-2 px-4">{tx.category}</td>
                <td className="py-2 px-4">₹{tx.amount}</td>
                <td className="py-2 px-4">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="py-2 px-4 space-x-1">
                  {tx.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 text-xs font-semibold mr-1 px-2.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="py-2 px-4">
                  {tx.fileUrl ? (
                    <a
                      href={`http://localhost:5000/${tx.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    onClick={() => dispatch(setSelectedTransaction(tx))}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTransaction(tx._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
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
