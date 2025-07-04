
import React, { useEffect, useState } from 'react';
import {
  useGetTransactionsQuery,
  useDeleteTransactionMutation,
} from '../../api/transactionApi';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTransaction } from '../../redux/slices/transactionSlice';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import ConfirmDialog from '../../components/ConfirmDialog';

const TransactionList = ({ userRole }) => {
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

  const [filterInputs, setFilterInputs] = useState({ category: '', date: '', tags: '' });
  const [filters, setFilters] = useState({ category: '', date: '', tags: '' });
  const [confirmId, setConfirmId] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInputs((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => setFilters({ ...filterInputs });

  const resetFilters = () => {
    setFilterInputs({ category: '', date: '', tags: '' });
    setFilters({ category: '', date: '', tags: '' });
  };

  const canEdit = userRole === 'owner' || userRole === 'accountant';
  const canDelete = userRole === 'owner';

  const handleDelete = async () => {
    try {
      await deleteTransaction({ id: confirmId, walletId }).unwrap();
      toast.success('Transaction deleted', { icon: <CheckCircle color="green" /> });
      setConfirmId(null);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete transaction', { icon: <CheckCircle color="red" /> });
    }
  };

  const categoryOptions = [...new Set(transactions.map((tx) => tx.category).filter(Boolean))];

  const filteredData = transactions.filter((tx) => {
    const matchesCategory = !filters.category || tx.category?.toLowerCase().includes(filters.category.toLowerCase());
    const matchesDate = !filters.date || tx.date?.substring(0, 10) === filters.date;
    const matchesTag = !filters.tags || (tx.tags && tx.tags.some((tag) => tag.toLowerCase().includes(filters.tags.toLowerCase())));
    return matchesCategory && matchesDate && matchesTag;
  });

  const hasTransfer = filteredData.some((tx) => tx.type === 'transfer');

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  if (!walletId) return <p className="text-red-600">⚠️ Please select a wallet to view transactions.</p>;
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500">Error fetching transactions.</p>;

  return (
    <div className="mt-6 relative z-10">
      {isToastVisible && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40 transition duration-300" />
      )}

      <Toaster
        toastOptions={{
          duration: 2000,
          className:
            'bg-white text-black px-6 py-4 rounded-xl shadow-lg border border-gray-200 text-center font-medium animate-fade-slide',
        }}
        containerStyle={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
        }}
      />

      <h2 className="text-lg font-semibold mb-4">All Transactions</h2>

      {/* Filters */}
      <div className="flex gap-2 items-center flex-wrap mb-6">
        <select
          name="category"
          value={filterInputs.category}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={filterInputs.date}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40"
          max={new Date().toISOString().split("T")[0]}
        />

        <input
          name="tags"
          placeholder="Tag"
          value={filterInputs.tags}
          onChange={handleFilterChange}
          className="border p-2 rounded w-40"
        />

        <button
          onClick={applyFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Filter
        </button>
        <button
          onClick={resetFilters}
          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto max-w-full">
        <table className="table-fixed w-full border border-gray-300 rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-3 w-24">Type</th>
              <th className="py-2 px-3 w-32">Category</th>
              <th className="py-2 px-3 w-24">Amount</th>
              {hasTransfer && <th className="py-2 px-3 w-40">Direction</th>}
              <th className="py-2 px-3 w-28">Date</th>
              <th className="py-2 px-3 w-40">Tags</th>
              <th className="py-2 px-3 w-20">Recurring</th>
              <th className="py-2 px-3 w-24">Frequency</th>
              <th className="py-2 px-3 w-20">File</th>
              <th className="py-2 px-3 w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((tx) => (
              <tr key={tx._id} className="border-t hover:bg-gray-50 h-14 align-middle">
                <td className="px-3 py-2 truncate">{tx.type}</td>
                <td className="px-3 py-2 truncate">{tx.category}</td>
                <td className="px-3 py-2 truncate">₹{tx.amount}</td>
                {hasTransfer && (
                  <td className="px-3 py-2 text-sm text-gray-700 whitespace-normal break-words">

                    {tx.type === 'transfer'
                      ? `${tx.isMirror ? (tx.toWalletId?.name || 'Unknown') : (tx.walletId?.name || 'Unknown')} → ${tx.isMirror ? (tx.walletId?.name || 'Unknown') : (tx.toWalletId?.name || 'Unknown')}`
                      : '—'}
                  </td>
                )}
                <td className="px-3 py-2 truncate">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 overflow-x-auto max-w-full">
                    {tx.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  {tx.recurring ? (
                    <FaCheckCircle className="text-green-600 inline w-4 h-4" />
                  ) : (
                    <FaTimesCircle className="text-red-600 inline w-4 h-4" />
                  )}
                </td>
                <td className="px-3 py-2 truncate">{tx.recurring ? tx.frequency || '—' : '—'}</td>
                <td className="px-3 py-2 truncate">
                  {tx.fileUrl ? (
                    <a
                      href={`http://localhost:5000/${tx.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                  ) : '—'}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => dispatch(setSelectedTransaction(tx))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setConfirmId(tx._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      {confirmId && (
        <ConfirmDialog
          message="Are you sure you want to delete this transaction?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default TransactionList;
