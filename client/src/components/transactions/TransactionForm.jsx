
import React, { useState, useEffect, useRef } from 'react';
import {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
} from '../../api/transactionApi';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedTransaction } from '../../redux/slices/transactionSlice';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';

const TransactionForm = ({ userRole, showDeleteSuccess }) => {
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.transactions.selectedTransaction);
  const walletId = useSelector((state) => state.wallets.selectedWallet?._id);
  const wallets = useSelector((state) => state.wallets.wallets);

  const [addTransaction] = useAddTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();

  const fileInputRef = useRef();
  const [filePreview, setFilePreview] = useState(null);

  const [form, setForm] = useState({
    category: '',
    amount: '',
    type: 'expense',
    description: '',
    date: '',
    tags: '',
    file: null,
    recurring: false,
    frequency: '',
    toWalletId: '',
  });

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  useEffect(() => {
    if (showDeleteSuccess) {
      toast.success('🗑️ Transaction deleted successfully');
    }
  }, [showDeleteSuccess]);

  useEffect(() => {
    if (selected?.isMirror) {
      toast.error(' This is a mirrored transfer transaction and cannot be edited.');
      dispatch(clearSelectedTransaction());
      return;
    }

    if (selected) {
      setForm({
        category: selected.category || '',
        amount: selected.amount || '',
        type: selected.type || 'expense',
        description: selected.note || '',
        date: selected.date ? selected.date.substring(0, 10) : '',
        tags: selected.tags?.join(', ') || '',
        file: null,
        recurring: selected.recurring || false,
        frequency: selected.frequency || '',
        toWalletId: selected.toWalletId?._id || selected.toWalletId || '',
      });
      setFilePreview(
        selected.fileUrl ? `http://localhost:5000/${selected.fileUrl}` : null
      );
    }
  }, [selected, dispatch]);

  if (userRole === 'viewer') return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      setForm({ ...form, file });
      setFilePreview(URL.createObjectURL(file));
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletId) {
      toast.error('⚠️ No wallet selected.');
      return;
    }

    // ✅ Preserve casing — do not convert to lowercase
    const preservedCategory = form.category.trim();
    const preservedTags = form.tags
      .split(',')
      .map((tag) => tag.trim()) // preserve original case
      .filter(Boolean)
      .join(',');

    const formData = new FormData();
    formData.append('category', preservedCategory);
    formData.append('amount', form.amount);
    formData.append('type', form.type);
    formData.append('note', form.description);
    formData.append('date', form.date);
    formData.append('walletId', walletId);
    formData.append('tags', preservedTags);
    formData.append('recurring', form.recurring);
    if (form.recurring && form.frequency) {
      formData.append('frequency', form.frequency);
    }
    if (form.type === 'transfer' && form.toWalletId) {
      formData.append('toWalletId', form.toWalletId);
    }
    if (form.file) {
      formData.append('file', form.file);
    }

    try {
      if (selected) {
        await updateTransaction({ id: selected._id, formData }).unwrap();
        toast.success('✅ Transaction updated');
      } else {
        await addTransaction(formData).unwrap();
        toast.success('✅ Transaction added');
      }

      dispatch(clearSelectedTransaction());
      setForm({
        category: '',
        amount: '',
        type: 'expense',
        description: '',
        date: '',
        tags: '',
        file: null,
        recurring: false,
        frequency: '',
        toWalletId: '',
      });
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('❌ Error submitting transaction:', err);
      toast.error(err.data?.message || 'Failed to submit transaction.');
    }
  };

  return (
    <>
      {/* Toast background overlay */}
      {isToastVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" />
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          className:
            'bg-white text-black px-6 py-4 rounded-xl shadow-lg border border-gray-200 text-center font-medium',
          style: {
            fontSize: '1rem',
            maxWidth: '90vw',
            zIndex: 50,
          },
        }}
        containerStyle={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded shadow bg-white relative z-10"
      >
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>

        {form.type === 'transfer' && (
          <select
            name="toWalletId"
            value={form.toWalletId}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Destination Wallet</option>
            {wallets
              .filter((w) => w._id !== walletId)
              .map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
          </select>
        )}

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
          max={new Date().toISOString().split('T')[0]}
          required
        />
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <div>
          <input
            type="file"
            name="file"
            onChange={handleChange}
            className="border p-2 rounded w-full"
            ref={fileInputRef}
          />
          {filePreview && (
            <div className="mt-2">
              {form.file?.type?.startsWith('image') ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="h-32 object-cover rounded"
                />
              ) : (
                <a
                  href={filePreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  Preview File
                </a>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              name="recurring"
              checked={form.recurring}
              onChange={handleChange}
            />
            Recurring Transaction
          </label>

          {form.recurring && (
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          )}
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {selected ? 'Update' : 'Add'} Transaction
          </button>
        </div>
      </form>
    </>
  );
};

export default TransactionForm;
