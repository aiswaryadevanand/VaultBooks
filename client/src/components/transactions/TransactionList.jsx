
import React, { useEffect, useState } from 'react';
import {
  useGetTransactionsQuery,
  useDeleteTransactionMutation,
} from '../../api/transactionApi';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTransaction } from '../../redux/slices/transactionSlice';
import { fetchWallets } from '../../redux/slices/walletSlice';

const TransactionList = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // ✅ current user
  const wallets = useSelector((state) => state.wallets.wallets || []);
  const [deleteTransaction] = useDeleteTransactionMutation();

  const {
    data: transactions = [],
    isLoading,
    isError,
    refetch, // ✅ refetch to update list on login/logout
  } = useGetTransactionsQuery();

  // 🔁 Fetch wallets on mount
  useEffect(() => {
    if (wallets.length === 0) {
      dispatch(fetchWallets());
    }
  }, [dispatch, wallets.length]);

  // 🔁 Refetch transactions when user changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const [filters, setFilters] = useState({
    category: '',
    walletName: '',
    date: '',
    tags: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const categoryOptions = [...new Set(transactions.map((tx) => tx.category).filter(Boolean))];
  const walletNameOptions = [...new Set(transactions.map((tx) => tx.walletId?.name).filter(Boolean))];

  const filteredData = transactions.filter((tx) => {
    const matchesCategory = !filters.category || tx.category?.toLowerCase().includes(filters.category.toLowerCase());
    const matchesWallet = !filters.walletName || tx.walletId?.name === filters.walletName;
    const matchesDate = !filters.date || tx.date?.substring(0, 10) === filters.date;
    const matchesTag =
      !filters.tags ||
      (tx.tags && tx.tags.some((tag) => tag.toLowerCase().includes(filters.tags.toLowerCase())));

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
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          name="walletName"
          value={filters.walletName}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40 text-left"
        >
          <option value="">All Wallets</option>
          {walletNameOptions.map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>

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

      {/* Transactions Table */}
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
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Wallet</th>
              <th className="py-2 px-3">Tags</th>
              <th className="py-2 px-3">File</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((tx) => (
              <tr key={tx._id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-3">{tx.type}</td>
                <td className="py-2 px-3">{tx.category}</td>
                <td className="py-2 px-3">₹{tx.amount}</td>
                <td className="py-2 px-3">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="py-2 px-3">{tx.walletId?.name || '—'}</td>
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
                <td className="py-2 px-3">
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
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
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

