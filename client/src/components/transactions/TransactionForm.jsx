
import React, { useState, useEffect, useRef } from 'react';
import {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
} from '../../api/transactionApi';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedTransaction } from '../../redux/slices/transactionSlice';

const TransactionForm = () => {
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.transactions.selectedTransaction);
  const walletId = useSelector((state) => state.wallets.selectedWallet?._id); // ✅ fixed to use selectedWallet
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
  });

  useEffect(() => {
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
      });
      setFilePreview(
        selected.fileUrl ? `http://localhost:5000/${selected.fileUrl}` : null
      );
    }
  }, [selected]);

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
      alert('No wallet selected.');
      return;
    }

    const formData = new FormData();
    formData.append('category', form.category);
    formData.append('amount', form.amount);
    formData.append('type', form.type);
    formData.append('note', form.description);
    formData.append('date', form.date);
    formData.append('walletId', walletId);
    formData.append('tags', form.tags);
    formData.append('recurring', form.recurring);
    
    // ✅ Only append frequency if recurring is true
    if (form.recurring && form.frequency) {
      formData.append('frequency', form.frequency);
    }

    if (form.file) {
      formData.append('file', form.file);
    }

    try {
      if (selected) {
        await updateTransaction({ id: selected._id, formData }).unwrap();
      } else {
        await addTransaction(formData).unwrap();
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
      });
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('❌ Error submitting transaction:', err);
      alert(err.data?.message || 'Failed to submit transaction.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded shadow bg-white"
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

      {/* ✅ Recurring Section */}
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
  );
};

export default TransactionForm;
