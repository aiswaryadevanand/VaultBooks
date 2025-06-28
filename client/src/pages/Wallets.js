import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from "../redux/slices/walletSlice";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Wallets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallets } = useSelector((state) => state.wallets);
  const { token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: "", type: "personal" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchWallets());
    }
  }, [dispatch, token]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    dispatch(createWallet(formData));
    setFormData({ name: "", type: "personal" });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    dispatch(updateWallet({ id: editId, ...formData }));
    setEditMode(false);
    setEditId(null);
    setFormData({ name: "", type: "personal" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this wallet?")) {
      dispatch(deleteWallet(id));
    }
  };

  const handleEdit = (wallet) => {
    setEditMode(true);
    setEditId(wallet._id);
    setFormData({ name: wallet.name, type: wallet.type });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/wallets-list")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Wallet List
        </button>
        <h1 className="text-2xl font-extrabold text-blue-700">VaultBooks</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Form */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {editMode ? "✏️ Edit Wallet" : "➕ Create Wallet"}
      </h2>
      <form
        onSubmit={editMode ? handleUpdate : handleCreate}
        className="space-y-4 bg-white p-4 shadow rounded"
      >
        <input
          type="text"
          placeholder="Wallet Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full border rounded p-2"
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full border rounded p-2"
        >
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editMode ? "Update Wallet" : "Create Wallet"}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: "", type: "personal" });
            }}
            className="ml-2 text-gray-600 underline"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Wallet List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Your Wallets</h3>
        {wallets.length === 0 ? (
          <p className="text-gray-500">No wallets yet.</p>
        ) : (
          <ul className="space-y-2">
            {wallets.map((wallet) => (
              <li
                key={wallet._id}
                className="p-3 border rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{wallet.name}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {wallet.type}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wallet._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wallets;
