

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';
import {
  getBudgets,
  createBudget,
  deleteBudget,
  updateBudget,
} from '../api/budgetAPI';

const Budget = () => {
  const { walletId } = useParams();
  const userRole = useSelector((state) => state.wallets.userRole || 'viewer');

  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editLimit, setEditLimit] = useState('');

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  const fetchBudgets = async () => {
    try {
      const res = await getBudgets(walletId);
      setBudgets(res.data);
    } catch (err) {
      toast.error('Failed to fetch budgets');
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
      toast.error('Budget for this category already exists.');
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
      toast.success(' Budget added');
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to create budget');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id, { walletId });
      toast.success(' Budget deleted');
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    if (userRole === 'viewer') return;
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
      toast.error('Another budget with this category already exists.');
      return;
    }

    try {
      await updateBudget(id, {
        walletId,
        category: normalizedEditCategory,
        limit: editLimit,
      });
      setEditId(null);
      toast.success(' Budget updated');
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to update budget');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
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

      <h2 className="text-2xl font-bold mb-4 text-center">💰 Budget Tracker</h2>

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
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full"
          >
            ➕ Add Budget
          </button>
        </form>
      )}

      <div className="space-y-4">
        {budgets.map((budget) => (
          <div
            key={budget._id}
            className="bg-gray-100 p-4 rounded-md flex justify-between items-center shadow"
          >
            {editId === budget._id ? (
              <div className="w-full flex flex-col md:flex-row gap-2 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-2 w-full">
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
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleUpdate(budget._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    ✅ Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <h3 className="text-lg font-semibold">{budget.category}</h3>
                  <p className="text-sm text-gray-600">
                    ₹{budget.spent} / ₹{budget.limit}
                  </p>

                  <div className="w-full bg-gray-300 h-3 rounded overflow-hidden mt-1">
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
                    ).toFixed(0)}
                    % used
                  </p>

                  {budget.spent >= budget.limit && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      ⚠️ Budget exceeded
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  {['owner', 'accountant'].includes(userRole) && (
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️ Edit
                    </button>
                  )}

                  {userRole === 'owner' && (
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Budget;
