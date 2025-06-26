
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
  const [addTransaction] = useAddTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    category: '',
    amount: '',
    type: 'expense',
    description: '',
    date: '',
    walletId: '',
    tags: '',
    file: null,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        category: selected.category || '',
        amount: selected.amount || '',
        type: selected.type || 'expense',
        description: selected.note || '',
        date: selected.date ? selected.date.substring(0, 10) : '',
        walletId: selected.walletId || '',
        tags: selected.tags ? selected.tags.join(', ') : '',
        file: null,
      });
    }
  }, [selected]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('category', form.category);
    formData.append('amount', form.amount);
    formData.append('type', form.type);
    formData.append('note', form.description);
    formData.append('date', form.date);
    formData.append('walletId', form.walletId);
    formData.append('tags', form.tags);
    if (form.file) formData.append('file', form.file);

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
        walletId: '',
        tags: '',
        file: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error submitting transaction:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded shadow bg-white">
      <input name="category" placeholder="Category" value={form.category} onChange={handleChange} className="border p-2 rounded" required />
      <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} className="border p-2 rounded" required />
      
      <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
        <option value="income">Income</option>
        <option value="expense">Expense</option>
        <option value="transfer">Transfer</option>
      </select>

      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-2 rounded" />
      <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />
      <input name="walletId" placeholder="Wallet ID" value={form.walletId} onChange={handleChange} className="border p-2 rounded" />
      <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} className="border p-2 rounded" />
      <input type="file" name="file" onChange={handleChange} className="border p-2 rounded" ref={fileInputRef} />

      <div className="md:col-span-2 text-right">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {selected ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
