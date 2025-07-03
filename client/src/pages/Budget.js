

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import {
  getBudgets,
  createBudget,
  deleteBudget,
  updateBudget,
} from '../api/budgetAPI';
import ConfirmDialog from '../components/ConfirmDialog';

const Budget = () => {
  const { walletId } = useParams();
  const userRole = useSelector((state) => state.wallets.userRole || 'viewer');

  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  const fetchBudgets = async () => {
    try {
      const res = await getBudgets(walletId);
      setBudgets(res.data);
    } catch {
      toast.error('Failed to fetch budgets', { icon: <CheckCircle color="red" /> });
    }
  };

  useEffect(() => {
    if (walletId) fetchBudgets();
  }, [walletId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const normalizedCategory = category.trim().toLowerCase();

    const exists = budgets.some(
      (b) => b.category?.trim().toLowerCase() === normalizedCategory
    );
    if (exists) {
      toast.error('Budget for this category already exists.', { icon: <CheckCircle color="red" /> });
      return;
    }

    try {
      await createBudget({
        walletId,
        category: normalizedCategory,
        limit,
        spent: 0,
      });
      setCategory('');
      setLimit('');
      toast.success('Budget added', { icon: <CheckCircle color="green" /> });
      fetchBudgets();
    } catch {
      toast.error('Failed to create budget', { icon: <CheckCircle color="red" /> });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBudget(confirmId, { walletId });
      toast.success('Budget deleted', { icon: <CheckCircle color="red" /> });
      fetchBudgets();
    } catch {
      toast.error('Failed to delete budget', { icon: <CheckCircle color="red" /> });
    } finally {
      setConfirmId(null);
    }
  };

  const handleEdit = (budget) => {
    setEditId(budget._id);
    setEditCategory(budget.category);
    setEditLimit(budget.limit);
  };

  const handleUpdate = async (id) => {
    const normalizedEditCategory = editCategory.trim().toLowerCase();
    const duplicate = budgets.some(
      (b) =>
        b._id !== id &&
        b.category?.trim().toLowerCase() === normalizedEditCategory
    );
    if (duplicate) {
      toast.error('Another budget with this category already exists.', { icon: <CheckCircle color="red" /> });
      return;
    }

    try {
      await updateBudget(id, {
        walletId,
        category: normalizedEditCategory,
        limit: editLimit,
      });
      setEditId(null);
      toast.success('Budget updated', { icon: <CheckCircle color="green" /> });
      fetchBudgets();
    } catch {
      toast.error('Failed to update budget', { icon: <CheckCircle color="red" /> });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
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

      <h2 className="text-2xl font-bold mb-4 text-left">Budget Tracker</h2>

      {['owner', 'accountant'].includes(userRole) && (
        <form
          onSubmit={handleCreate}
          className="bg-white shadow p-4 rounded-md mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. Groceries"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Limit (₹)</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. 5000"
              required
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full">
            Add Budget
          </button>
        </form>
      )}

      <div className="space-y-4">
        {budgets.map((budget) => (
          <div
            key={budget._id}
            className="bg-gray-100 p-4 rounded shadow space-y-2  flex justify-between items-start "
          >
            {editId === budget._id ? (
              <div className="w-full flex flex-col md:flex-row gap-2">
                <input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="border px-2 py-1 rounded w-full md:w-1/2"
                />
                <input
                  type="number"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="border px-2 py-1 rounded w-full md:w-1/3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(budget._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <h3 className="text-lg font-semibold capitalize">
                    {budget.category}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ₹{budget.spent} / ₹{budget.limit}
                  </p>
                  <div className="w-full bg-gray-300 h-2 rounded overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-300 ${
                        (budget.spent / budget.limit) * 100 >= 100
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          (budget.spent / budget.limit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">
                    {Math.min(
                      (budget.spent / budget.limit) * 100,
                      100
                    ).toFixed(0)}%
                  </p>
                  {budget.spent >= budget.limit && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      Budget exceeded
                    </p>
                  )}
                </div>

                {['owner', 'accountant'].includes(userRole) && (
                  <div className="flex gap-3 mt-2 items-center">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    {userRole === 'owner' && (
                      <button
                        onClick={() => setConfirmId(budget._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {confirmId && (
        <ConfirmDialog
          message="Are you sure you want to delete this budget?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default Budget;
