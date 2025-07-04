

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from "../redux/slices/walletSlice";
import { useNavigate } from "react-router-dom";
import Header from "../pages/Header";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { CheckCircle } from "lucide-react";

const Wallets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallets } = useSelector((state) => state.wallets);
  const { token, user } = useSelector((state) => state.auth);

  const userWallets = wallets.filter((wallet) => {
    const creatorId =
      typeof wallet.createdBy === "string"
        ? wallet.createdBy
        : wallet.createdBy?._id;
    return creatorId === user?._id;
  });

  const [formData, setFormData] = useState({ name: "", type: "personal" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const { toasts } = useToasterStore();
  const isToastVisible = toasts.some((t) => t.visible);

  useEffect(() => {
    if (token) {
      dispatch(fetchWallets());
    }
  }, [dispatch, token]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    dispatch(createWallet(formData))
      .unwrap()
      .then(() => toast.success("Wallet created successfully", { icon: <CheckCircle color="green" /> }))
      .catch(() => toast.error("Failed to create wallet"));

    setFormData({ name: "", type: "personal" });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    dispatch(updateWallet({ id: editId, ...formData }))
      .unwrap()
      .then(() => toast.success("Wallet updated successfully", { icon: <CheckCircle color="green" /> }))
      .catch(() => toast.error("Failed to update wallet"));

    setEditMode(false);
    setEditId(null);
    setFormData({ name: "", type: "personal" });
  };

  const handleDelete = () => {
    dispatch(deleteWallet(confirmId))
      .unwrap()
      .then(() => toast.success("Wallet deleted successfully", { icon: <CheckCircle color="green" /> }))
      .catch(() => toast.error("Failed to delete wallet"));
    setConfirmId(null);
  };

  const handleEdit = (wallet) => {
    setEditMode(true);
    setEditId(wallet._id);
    setFormData({ name: wallet.name, type: wallet.type });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isToastVisible && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40 transition duration-300" />
      )}
      <Toaster
        toastOptions={{
          duration: 3000,
          className:
            "bg-white text-black px-6 py-4 rounded-xl shadow-lg border border-gray-200 text-center font-medium animate-fade-slide",
        }}
        containerStyle={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        }}
      />

      <Header />
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editMode ? "Edit Wallet" : "Create Wallet"}
        </h2>

        <form
          onSubmit={editMode ? handleUpdate : handleCreate}
          className="space-y-4 bg-white p-4 shadow rounded"
        >
          <input
            type="text"
            placeholder="Wallet Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            className="w-full border rounded p-2"
          />
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="w-full border rounded p-2"
          >
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
          <div className="flex items-center gap-3">
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
                className="text-gray-600 "
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Wallet List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Your Wallets</h3>
          {userWallets.length === 0 ? (
            <p className="text-gray-500">No wallets yet.</p>
          ) : (
            <ul className="space-y-2">
              {userWallets.map((wallet) => (
                <li
                  key={wallet._id}
                  className="p-3 border rounded flex justify-between items-center bg-white shadow-sm"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/wallets/${wallet._id}`)}
                  >
                    <p className="font-medium text-blue-600 ">{wallet.name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {wallet.type}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(wallet)}
                      className="text-blue-600 "
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmId(wallet._id)}
                      className="text-red-600 "
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

      {/* Confirm Dialog */}
      {confirmId && (
        <ConfirmDialog
          message="Are you sure you want to delete this wallet?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default Wallets;
